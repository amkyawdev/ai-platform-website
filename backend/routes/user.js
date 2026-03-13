/**
 * User Routes
 * AmkyawDev AI Power Platform
 */

const express = require('express');
const router = express.Router();

// GET /api/user/profile - Get user profile
router.get('/profile', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({
                error: {
                    message: 'Unauthorized',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Would fetch from database in production
        res.json({
            success: true,
            user: {
                id: userId,
                email: 'user@example.com',
                name: 'User',
                settings: {
                    language: 'my',
                    model: 'gpt-3.5-turbo',
                    temperature: 0.7
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { name, settings } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                error: {
                    message: 'Unauthorized',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Would update in database in production
        res.json({
            success: true,
            user: {
                id: userId,
                name,
                settings
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/user/usage - Get user usage stats
router.get('/usage', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({
                error: {
                    message: 'Unauthorized',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Would fetch from database in production
        res.json({
            success: true,
            usage: {
                chats: 0,
                tokens: 0,
                images: 0,
                transcriptionMinutes: 0,
                period: {
                    start: new Date().toISOString(),
                    end: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/user/history - Get user chat history
router.get('/history', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { limit = 50, offset = 0 } = req.query;
        
        if (!userId) {
            return res.status(401).json({
                error: {
                    message: 'Unauthorized',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Would fetch from database in production
        res.json({
            success: true,
            history: [],
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: 0
            }
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/user/history/:id - Delete chat history
router.delete('/history/:id', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        
        if (!userId) {
            return res.status(401).json({
                error: {
                    message: 'Unauthorized',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Would delete from database in production
        res.json({
            success: true,
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/user/models - Get available models
router.get('/models', (req, res) => {
    res.json({
        success: true,
        models: [
            { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
            { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
            { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
            { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta' }
        ]
    });
});

module.exports = router;
