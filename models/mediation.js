const mongoose = require('mongoose');

const MediationSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    tipoFalta: { type: String, required: true },
    sede: { type: String, required: true },
    estado: { type: String, default: 'Proceso' }, // Estado por defecto
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencia al usuario
    createdAt: { type: Date, default: Date.now } // Fecha de creación
});

module.exports = mongoose.model('Mediation', MediationSchema, 'mediations'); // El tercer parámetro es el nombre de la colección