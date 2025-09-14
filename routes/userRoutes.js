const express = require('express');
const router = express.Router();
const { User, Doctor, MedicalSpecialty } = require('../models');
const { Op } = require('sequelize');
const { buildSequelizeWhere } = require('../utils/utils');

// GET /api/v1/users : récupère tous les users avec doctor (left join)
router.get('/', async (req, res) => {
  try {
    // Récupération des paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;

    // Requête Sequelize avec jointures
    const { count, rows } = await User.findAndCountAll({
      include: [{
        model: Doctor,
        required: false,
        include: [{
          model: MedicalSpecialty,
          required: false
        }]
      }],
      limit: size,
      offset: offset
    });

    // Réponse structurée
    res.json({
      items: rows,
      total: count,
      page,
      size
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs.' });
  }
});

// GET /api/v1/users/role?role=DOCTOR&page=1&size=10
router.get('/role', async (req, res) => {
  try {
    const role = (req.query.role || '').toUpperCase();
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;

    // 🔍 Parsing des filtres
    let filters = {};
    try {
      filters = req.query.filters ? JSON.parse(req.query.filters) : {};
    } catch (e) {
      console.warn('Erreur de parsing des filtres:', e);
    }
    const where = {
      role,
      ...buildSequelizeWhere(filters, User.rawAttributes)
    };
    // 🔗 Construction des relations
    const include = role === 'DOCTOR'
      ? [{
        model: Doctor,
        required: false,
        include: [{ model: MedicalSpecialty, required: false }]
      }]
      : [{ model: Doctor, required: false }];

    // 📦 Requête Sequelize
    const { count, rows } = await User.findAndCountAll({
      where,
      include,
      limit: size,
      offset
    });

    // ✅ Réponse
    res.json({
      items: rows,
      total: count,
      page,
      size
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs par rôle :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs.' });
  }
});

module.exports = router;
