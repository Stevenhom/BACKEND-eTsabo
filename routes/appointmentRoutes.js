const { stripSeconds } = require('../utils/utils');
const express = require('express');
const router = express.Router();
const { Appointment } = require('../models');
const { Op } = require('sequelize');


// POST /api/v1/appointments
router.post('/', async (req, res) => {
    try {
        const {
            patient_id,
            doctor_id,
            appointment_date,
            description = '',
            is_emergency = false
        } = req.body;

        if (!patient_id || !doctor_id || !appointment_date) {
            return res.status(400).json({ error: 'patient_id, doctor_id et appointment_date sont requis.' });
        }

        const conflict = await Appointment.findOne({
            where: {
                doctor_id,
                appointment_date: stripSeconds(appointment_date),
                status: { [Op.in]: ['REQUESTED', 'SCHEDULED'] }
            }
        });

        if (conflict) {
            return res.status(409).json({ error: 'Le docteur a déjà un rendez-vous à cette heure.' });
        }

        const newAppointment = await Appointment.create({
            patientId: patient_id,
            doctorId: doctor_id,
            appointmentDate: stripSeconds(appointment_date),
            description,
            isEmergency: is_emergency,
            status: 'REQUESTED',
            createdAt: new Date()
        });

        res.status(201).json({ message: 'Rendez-vous créé avec succès.', appointment: newAppointment });
    } catch (error) {
        console.error('Erreur lors de la création du rendez-vous :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la création du rendez-vous.' });
    }
});

module.exports = router;
