const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['mediation_created', 'mediation_updated', 'status_changed', 'other'],
        required: true 
    },
    relatedMediation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Mediation' 
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    // Nuevo campo para identificar notificaciones compartidas
    sharedId: {
        type: String,
        index: true
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);