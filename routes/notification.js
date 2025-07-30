const express = require('express');
const {
    sendNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    notifyMediationCreated,
    notifyMediationUpdated
} = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware para inyectar io
const injectIO = (req, res, next) => {
    req.io = req.app.get('io');
    next();
};

router.post('/', authMiddleware, injectIO, sendNotification);
router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/read-all', authMiddleware, markAllAsRead);
router.post('/notify-mediation-created', authMiddleware, injectIO, notifyMediationCreated);
router.post('/notify-mediation-updated', authMiddleware, injectIO, notifyMediationUpdated);

module.exports = router;