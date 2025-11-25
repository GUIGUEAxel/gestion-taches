const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // ces options ne sont plus toujours nécessaires avec les dernières versions,
      // mais les laisser ne gêne pas
    });
    console.log(`MongoDB connecté : ${conn.connection.host}`);
  } catch (err) {
    console.error('Erreur de connexion à MongoDB', err.message);
    process.exit(1); // arrêter l'app si la connexion échoue
  }
};

module.exports = connectDB;
