const Notification = require('../models/Notification');
const User = require('../models/User');
const Mediation = require('../models/mediation');

// Tipos de notificación centralizados
const NOTIFICATION_TYPES = {
    MEDIATION_CREATED: 'mediation_created',
    MEDIATION_UPDATED: 'mediation_updated',
    STATUS_CHANGED: 'status_changed',
    OTHER: 'other'
};

// Enviar notificación
const sendNotification = async (req, res) => {
    const { userId, message, type, relatedMediation, sharedId } = req.body;

    try {
        if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
            return res.status(400).json({ message: 'Tipo de notificación no válido' });
        }

        const notification = new Notification({
            userId,
            message,
            type,
            relatedMediation,
            sharedId
        });

        await notification.save();

        if (req.io) {
            req.io.to(userId).emit('notification', notification);
            // Actualizar estado de notificaciones no leídas
            await User.findByIdAndUpdate(userId, { hasUnreadNotifications: true });
        }

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener notificaciones del usuario
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user._id
        })
        .sort({ createdAt: -1 })
        .populate('relatedMediation');

        res.json(notifications);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Marcar notificación como leída (sin eliminar)
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        // Verificar si quedan notificaciones no leídas
        const unreadCount = await Notification.countDocuments({
            userId: req.user._id,
            read: false
        });

        await User.findByIdAndUpdate(req.user._id, {
            hasUnreadNotifications: unreadCount > 0
        });

        res.json(notification);
    } catch (error) {
        console.error('Error al marcar como leída:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Marcar todas como leídas
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );

        await User.findByIdAndUpdate(req.user._id, {
            hasUnreadNotifications: false
        });

        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Error al marcar todas como leídas:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Notificar creación de mediación
const notifyMediationCreated = async (req, res) => {
    const { mediationId } = req.body;

    try {
        const mediation = await Mediation.findById(mediationId).populate('createdBy');
        if (!mediation) {
            return res.status(404).json({ message: 'Mediación no encontrada' });
        }

        // Generar un ID compartido para esta notificación
        const sharedId = `mediation_${mediationId}_created`;

        // Buscar docentes y mediadores
        const recipients = await User.find({
            role: { $in: ['docente', 'mediador'] }
        });

        // Crear notificaciones
        const notifications = recipients.map(user => ({
            userId: user._id,
            message: `Nueva mediación creada por ${mediation.createdBy.username}: ${mediation.titulo}`,
            type: NOTIFICATION_TYPES.MEDIATION_CREATED,
            relatedMediation: mediationId,
            sharedId
        }));

        await Notification.insertMany(notifications);

        // Emitir notificaciones en tiempo real
        if (req.io) {
            recipients.forEach(user => {
                req.io.to(user._id).emit('notification', {
                    userId: user._id,
                    message: `Nueva mediación creada por ${mediation.createdBy.username}: ${mediation.titulo}`,
                    type: NOTIFICATION_TYPES.MEDIATION_CREATED,
                    relatedMediation: mediationId,
                    sharedId
                });
            });
        }

        res.json({ message: 'Notificaciones enviadas' });
    } catch (error) {
        console.error('Error al notificar creación:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Notificar actualización de mediación
const notifyMediationUpdated = async (req, res) => {
    const { mediationId, status } = req.body;

    try {
        const mediation = await Mediation.findById(mediationId).populate('createdBy');
        if (!mediation) {
            return res.status(404).json({ message: 'Mediación no encontrada' });
        }

        // Notificar al estudiante
        const studentNotification = new Notification({
            userId: mediation.createdBy._id,
            message: `El estado de tu mediación "${mediation.titulo}" ha cambiado a "${status}"`,
            type: NOTIFICATION_TYPES.STATUS_CHANGED,
            relatedMediation: mediationId
        });

        await studentNotification.save();

        if (req.io) {
            req.io.to(mediation.createdBy._id).emit('notification', studentNotification);
        }

        res.json({ message: 'Notificación enviada al estudiante' });
    } catch (error) {
        console.error('Error al notificar actualización:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    sendNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    notifyMediationCreated,
    notifyMediationUpdated,
    NOTIFICATION_TYPES
};