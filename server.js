// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connexion à MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Route simple de test
app.get('/', (req, res) => {
  res.send('API Gestion de tâches - OK');
});

// TODO: routes /tasks viendront ici
// const taskRoutes = require('./routes/tasks');
// app.use('/tasks', taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
