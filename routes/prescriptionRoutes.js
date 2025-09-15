const express = require('express');
const router = express.Router();
const { Prescription, TeleConsultation, Appointment, User } = require('../models');

// GET /api/v1/prescriptions/by-teleconsultation/:id
router.get('/by-teleconsultation/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findOne({
      where: { teleconsultationId: id },
      include: [
        {
          model: TeleConsultation,
          as: 'Teleconsultation',
          include: [
            {
              model: Appointment,
              as: 'Appointment',
              include: [
                { model: User, as: 'Patient', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'Doctor', attributes: ['id', 'firstName', 'lastName'] }
              ]
            }
          ]
        }
      ]
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Aucune prescription trouvée pour cette téléconsultation.' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Erreur lors de la récupération de la prescription :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
