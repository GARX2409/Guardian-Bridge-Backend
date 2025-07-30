const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['estudiante', 'docente', 'mediador', 'developer'],
        required: true,
    },
    sede: {
        type: String,
        enum: ['popular', 'central', 'vallejo', 'calvache'],
        required: true,
    },
    grado: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    socketId: String,
    hasUnreadNotifications: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);