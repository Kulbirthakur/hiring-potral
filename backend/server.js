const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auto-initialize one_time_links table in PostgreSQL
const initDbTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS one_time_links (
        link_id SERIAL PRIMARY KEY,
        token VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
        is_used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP,
        candidate_email VARCHAR(255)
      );
    `);
    console.log('PostgreSQL one_time_links table initialized.');
  } catch (err) {
    console.error('Error initializing tables:', err.message);
  }
};
initDbTables();

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    res.json({ 
      status: 'ok', 
      database: 'connected', 
      time: result.rows[0].current_time 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// GENERATE ONE-TIME SINGLE-USE APPLICATION LINK
app.post('/api/links/generate', async (req, res) => {
  try {
    const token = crypto.randomBytes(16).toString('hex');
    const insertQuery = `
      INSERT INTO one_time_links (token, created_at, expires_at, is_used)
      VALUES ($1, NOW(), NOW() + INTERVAL '7 days', FALSE)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [token]);
    const linkRecord = result.rows[0];

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const oneTimeLink = `${frontendUrl}/?view=apply&token=${token}`;

    res.status(201).json({
      success: true,
      token: token,
      one_time_link: oneTimeLink,
      expires_at: linkRecord.expires_at
    });
  } catch (error) {
    console.error('Error generating one-time link:', error);
    res.status(500).json({ error: 'Failed to generate single-use application link.' });
  }
});

// VALIDATE ONE-TIME LINK TOKEN
app.get('/api/links/validate', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.json({ valid: true, single_use: false }); // General portal link
    }

    const checkQuery = `
      SELECT * FROM one_time_links 
      WHERE token = $1;
    `;
    const result = await db.query(checkQuery, [token.trim()]);

    if (result.rows.length === 0) {
      return res.json({ valid: false, reason: 'INVALID_TOKEN' });
    }

    const linkData = result.rows[0];

    if (linkData.is_used) {
      return res.json({ valid: false, reason: 'ALREADY_USED', used_at: linkData.used_at });
    }

    if (new Date(linkData.expires_at) < new Date()) {
      return res.json({ valid: false, reason: 'EXPIRED' });
    }

    res.json({ valid: true, single_use: true, token: linkData.token });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ valid: false, error: 'Token validation error.' });
  }
});

// GET all applications with filter & search
app.get('/api/applications', async (req, res) => {
  try {
    const { status, search, department, job_title } = req.query;
    let query = 'SELECT * FROM job_applications WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND application_status = $${params.length}`;
    }

    if (department && department !== 'All') {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }

    if (job_title && job_title !== 'All') {
      params.push(job_title);
      query += ` AND job_title = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      query += ` AND (candidate_name ILIKE $${idx} OR email ILIKE $${idx} OR skills ILIKE $${idx} OR current_job_title ILIKE $${idx} OR location ILIKE $${idx})`;
    }

    query += ' ORDER BY application_id DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch job applications.' });
  }
});

// GET statistics summary
app.get('/api/stats', async (req, res) => {
  try {
    const totalRes = await db.query('SELECT COUNT(*) as total FROM job_applications');
    const statusRes = await db.query(`
      SELECT 
        COALESCE(application_status, 'Applied') as status, 
        COUNT(*) as count 
      FROM job_applications 
      GROUP BY COALESCE(application_status, 'Applied')
    `);

    const deptRes = await db.query(`
      SELECT 
        COALESCE(department, 'General') as department, 
        COUNT(*) as count 
      FROM job_applications 
      GROUP BY COALESCE(department, 'General')
    `);

    const stats = {
      total: parseInt(totalRes.rows[0].total || 0),
      applied: 0,
      screening: 0,
      interview_scheduled: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
      departments: deptRes.rows
    };

    statusRes.rows.forEach(row => {
      const s = row.status.toLowerCase().replace(/\s+/g, '_');
      stats[s] = parseInt(row.count || 0);
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch hiring statistics.' });
  }
});

// GET single application details
app.get('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM job_applications WHERE application_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate application not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch candidate details.' });
  }
});

// POST new job application (with 1-time token burn and duplicate email validation)
app.post('/api/applications', async (req, res) => {
  try {
    const {
      token,
      candidate_name,
      email,
      phone,
      location,
      experience_years,
      current_job_title,
      skills,
      education,
      job_title,
      department,
      employment_type,
      expected_salary,
      notice_period,
      resume_file_name,
      resume_file_url,
      cover_letter,
      candidate_source
    } = req.body;

    if (!candidate_name || !email || !job_title) {
      return res.status(400).json({ error: 'Candidate name, email, and job title are required.' });
    }

    // Check if token was provided and if it is already used
    if (token) {
      const tokenRes = await db.query('SELECT * FROM one_time_links WHERE token = $1', [token.trim()]);
      if (tokenRes.rows.length === 0 || tokenRes.rows[0].is_used) {
        return res.status(400).json({ error: 'This single-use application link has expired or has already been used.' });
      }
    }

    // STRICT CHECK: Ensure only ONE submission per person (by email address)
    const existingCheck = await db.query(
      'SELECT application_id, candidate_name, applied_at FROM job_applications WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        error: `An application has already been submitted using the email address "${email.trim()}". Only one response per person is allowed.`
      });
    }

    const insertQuery = `
      INSERT INTO job_applications (
        candidate_name, email, phone, location, experience_years, current_job_title,
        skills, education, job_title, department, employment_type, expected_salary,
        notice_period, resume_file_name, resume_file_url, cover_letter, candidate_source,
        application_status, applied_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        'Applied', NOW(), NOW()
      ) RETURNING *;
    `;

    const values = [
      candidate_name,
      email.trim(),
      phone || null,
      location || null,
      experience_years ? parseFloat(experience_years) : 0,
      current_job_title || null,
      skills || null,
      education || null,
      job_title,
      department || 'Engineering',
      employment_type || 'Full-time',
      expected_salary ? parseFloat(expected_salary) : null,
      notice_period || 'Immediate',
      resume_file_name || null,
      resume_file_url || null,
      cover_letter || null,
      candidate_source || 'Careers Portal'
    ];

    const result = await db.query(insertQuery, values);
    const newApplication = result.rows[0];

    // MARK SINGLE-USE TOKEN AS EXPIRED / USED
    if (token) {
      await db.query(
        'UPDATE one_time_links SET is_used = TRUE, used_at = NOW(), candidate_email = $1 WHERE token = $2',
        [email.trim(), token.trim()]
      );
    }

    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to submit application: ' + error.message });
  }
});

// PATCH update application status, notes, interview schedule
app.patch('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      application_status,
      recruiter_notes,
      interview_date,
      interview_status,
      interviewer_name
    } = req.body;

    const fields = [];
    const values = [];

    if (application_status !== undefined) {
      values.push(application_status);
      fields.push(`application_status = $${values.length}`);
    }

    if (recruiter_notes !== undefined) {
      values.push(recruiter_notes);
      fields.push(`recruiter_notes = $${values.length}`);
    }

    if (interview_date !== undefined) {
      values.push(interview_date || null);
      fields.push(`interview_date = $${values.length}`);
    }

    if (interview_status !== undefined) {
      values.push(interview_status);
      fields.push(`interview_status = $${values.length}`);
    }

    if (interviewer_name !== undefined) {
      values.push(interviewer_name);
      fields.push(`interviewer_name = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    values.push(new Date());
    fields.push(`updated_at = $${values.length}`);

    values.push(id);
    const updateQuery = `
      UPDATE job_applications 
      SET ${fields.join(', ')} 
      WHERE application_id = $${values.length} 
      RETURNING *;
    `;

    const result = await db.query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application.' });
  }
});

// DELETE application
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM job_applications WHERE application_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json({ message: 'Application deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application.' });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js Hiring Backend API running on http://localhost:${PORT}`);
});
