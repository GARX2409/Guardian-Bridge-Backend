const Mediation = require('../models/mediation');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Obtener todas las mediaciones (filtradas por rol)
const getMediations = async (req, res) => {
    try {
        const userRole = req.user.role; // Obtener el rol del usuario desde el token
        const userId = req.user.id; // Obtener el ID del usuario desde el token

        let mediations;

        if (userRole === 'estudiante') {
            // Si es estudiante, solo obtén sus mediaciones
            mediations = await Mediation.find({ createdBy: userId }).populate('createdBy');
        } else {
            // Si es docente, mediador o developer, obtén todas las mediaciones
            mediations = await Mediation.find().populate('createdBy');
        }

        res.json(mediations);
    } catch (error) {
        console.error('Error al obtener las mediaciones:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Crear una nueva mediación
const createMediation = async (req, res) => {
    const { nombre, titulo, descripcion, tipoFalta, sede } = req.body;
    const createdBy = req.user.id;

    try {
        // Crear la mediación
        const mediation = new Mediation({
            nombre,
            titulo,
            descripcion,
            tipoFalta,
            sede,
            createdBy,
        });

        await mediation.save();

        // Enviar notificación a mediadores y docentes
        const mediadores = await User.find({ role: 'mediador' });
        const docentes = await User.find({ role: 'docente' });

        const recipients = [...mediadores, ...docentes];

        recipients.forEach(async (user) => {
            const notification = new Notification({
                userId: user._id,
                message: `Nueva mediación creada: ${titulo}`, // Mensaje de la notificación
                type: 'mediation_created',
            });

            await notification.save();
        });

        res.status(201).json(mediation);
    } catch (error) {
        console.error('Error al crear la mediación:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
// Actualizar la mediación
const updateMediation = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        // Validar que el estado esté presente
        if (!estado) {
            return res.status(400).json({ message: 'El campo "estado" es obligatorio' });
        }

        // Actualizar la mediación
        const mediation = await Mediation.findByIdAndUpdate(
            id,
            { estado },
            { new: true } // Devuelve el documento actualizado
        );

        if (!mediation) {
            return res.status(404).json({ message: 'Mediación no encontrada' });
        }

        res.json(mediation);
    } catch (error) {
        console.error('Error al actualizar la mediación:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Eliminar una mediación
const deleteMediation = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar la mediación
        const mediation = await Mediation.findByIdAndDelete(id);

        if (!mediation) {
            return res.status(404).json({ message: 'Mediación no encontrada' });
        }

        res.json({ message: 'Mediación eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la mediación:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

module.exports = { getMediations, createMediation, updateMediation, deleteMediation };