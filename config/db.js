const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://puenteguardian1:puenteguardian1@dbcolegio.occi4.mongodb.net/proyecto-pg?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conexión a MongoDB Atlas establecida');
    } catch (error) {
        console.error('Error conectando a MongoDB Atlas:', error);
        process.exit(1);
    }
};

module.exports = connectDB;