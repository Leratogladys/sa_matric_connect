const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../database');

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard data
router.get('/data', async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get user's applications count
        const appsResult = await pool.query(
            `SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN type = 'bursary' THEN 1 END) as bursary
             FROM applications 
             WHERE user_id = $1`,
            [userId]
        );
        
        // Get recent activity
        const activityResult = await pool.query(
            `SELECT id, action, status, created_at 
             FROM user_activity 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 5`,
            [userId]
        );
        
        // Get upcoming deadlines
        const deadlinesResult = await pool.query(
            `SELECT id, title, deadline, type 
             FROM deadlines 
             WHERE deadline > NOW() 
             ORDER BY deadline ASC 
             LIMIT 5`
        );
        
        res.json({
            success: true,
            stats: {
                totalApplications: parseInt(appsResult.rows[0]?.total || 0),
                completedApplications: parseInt(appsResult.rows[0]?.completed || 0),
                pendingApplications: parseInt(appsResult.rows[0]?.pending || 0),
                bursaryApplications: parseInt(appsResult.rows[0]?.bursary || 0)
            },
            recentActivity: activityResult.rows.map(row => ({
                id: row.id,
                action: row.action,
                status: row.status,
                date: row.created_at
            })),
            upcomingDeadlines: deadlinesResult.rows.map(row => ({
                id: row.id,
                title: row.title,
                deadline: row.deadline,
                type: row.type,
                daysLeft: Math.ceil((new Date(row.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            }))
        });
        
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load dashboard data' 
        });
    }
});

// Update application status
router.post('/application/update', async (req, res) => {
    try {
        const { applicationId, completed } = req.body;
        const userId = req.user.userId;
        
        await pool.query(
            'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [completed ? 'completed' : 'pending', applicationId, userId]
        );
        
        // Log activity
        await pool.query(
            'INSERT INTO user_activity (user_id, action, status) VALUES ($1, $2, $3)',
            [userId, `Updated application ${applicationId}`, 'completed']
        );
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

module.exports = router;
