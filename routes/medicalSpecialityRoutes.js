const express = require('express');
const router = express.Router();
const { MedicalSpecialty } = require('../models');

// Route GET pour récupérer toutes les spécialités médicales
router.get('/', async (req, res) => {
	try {
		const specialties = await MedicalSpecialty.findAll();
		res.json(specialties);
	} catch (error) {
		res.status(500).json({ error: 'Erreur serveur lors de la récupération des spécialités médicales.' });
	}
});

module.exports = router;
