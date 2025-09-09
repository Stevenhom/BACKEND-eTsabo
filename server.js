// server.js

// Importer les modules nécessaires
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Créer une instance d'Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour parser les requêtes JSON
app.use(cors());
app.use(express.json());

// Vérifier que JWT_SECRET est bien défini
if (!process.env.JWT_SECRET) {
  console.error("❌ Erreur: JWT_SECRET non défini !");
  process.exit(1);
}

// Connexion à PostgreSQL via Sequelize
const sequelize = require('./config/db'); // Fichier de config Sequelize

sequelize.authenticate()
  .then(() => console.log("✅ PostgreSQL connecté via Sequelize"))
  .catch(err => {
    console.error("❌ Erreur de connexion PostgreSQL :", err);
    process.exit(1);
  });

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
//app.use('/auth', require('./routes/forgotPasswordRoutes'));
//app.use('/auth', require('./routes/resetPasswordRoutes'));

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
