const express = require('express');
const router = express.Router();
const { User, Doctor, MedicalSpecialty } = require('../models');
const { Op } = require('sequelize');

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

    console.log('Filtres reçus :', filters);

    // 🔧 Construction du where Sequelize
    const where = { role };

    for (const field in filters) {
      const conditions = filters[field];
      if (!Array.isArray(conditions) || conditions.length === 0) continue;

      const { value, matchMode } = conditions[0];
      if (value === null || value === undefined || value === '') continue;

      // Vérifie que le champ existe dans le modèle User
      if (!User.rawAttributes[field]) {
        console.warn(`Champ inconnu dans User : ${field} — ignoré`);
        continue;
      }

      switch (matchMode) {
        case 'startsWith':
          where[field] = { [Op.iLike]: `${value}%` };
          break;
        case 'contains':
          where[field] = { [Op.iLike]: `%${value}%` };
          break;
        case 'endsWith':
          where[field] = { [Op.iLike]: `%${value}` };
          break;
        case 'equals':
          where[field] = value;
          break;
        case 'dateIs':
          where[field] = { [Op.eq]: value };
          break;
        default:
          console.warn(`MatchMode non géré : ${matchMode}`);
      }
    }

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
