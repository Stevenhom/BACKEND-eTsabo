const { stripSeconds, buildSequelizeWhere } = require('../utils/utils');
const express = require('express');
const router = express.Router();
const { Appointment, User, TeleConsultation, VideoSession } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

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

router.get('/', async (req, res) => {
    try {
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

        const where = buildSequelizeWhere(filters, Appointment.rawAttributes);

        // 🔍 Filtrage par doctorId ou patientId via query params
        if (req.query.doctorId) {
            where.doctorId = req.query.doctorId;
        }
        if (req.query.patientId) {
            where.patientId = req.query.patientId;
        }

        // 🔗 Relations : Patient et Doctor
        const include = [
            { model: User, as: 'Patient', attributes: ['id', 'firstName', 'lastName'] },
            { model: User, as: 'Doctor', attributes: ['id', 'firstName', 'lastName'] }
        ];

        // 📦 Requête Sequelize
        const { count, rows } = await Appointment.findAndCountAll({
            where,
            include,
            limit: size,
            offset,
            order: [['appointmentDate', 'ASC']]
        });

        // ✅ Réponse
        res.json({
            items: rows,
            total: count,
            page,
            size
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des rendez-vous.' });
    }
});

// PATCH /api/v1/appointments/:id/status
router.patch('/:id/status', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status, mode = 'VIDEO', notes = '' } = req.body;

        const allowedStatuses = ['REQUESTED', 'SCHEDULED', 'CANCELED', 'COMPLETED'];
        if (!allowedStatuses.includes(status)) {
            await transaction.rollback();
            return res.status(400).json({ error: `Statut invalide : ${status}` });
        }

        const appointment = await Appointment.findByPk(id, { transaction });
        if (!appointment) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Rendez-vous introuvable.' });
        }

        if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELED') {
            await transaction.rollback();
            return res.status(409).json({ error: `Le rendez-vous est déjà ${appointment.status.toLowerCase()}.` });
        }

        appointment.status = status;
        await appointment.save({ transaction });

        let teleconsultation = null;
        let videoSession = null;

        if (status === 'SCHEDULED') {
            // Création de la téléconsultation
            teleconsultation = await TeleConsultation.create({
                appointmentId: appointment.id,
                mode,
                notes
            }, { transaction });

            // Création de la session vidéo
            const roomName = `appointment-${appointment.id}-${Date.now()}`;
            videoSession = await VideoSession.create({
                teleconsultationId: teleconsultation.id,
                roomName,
                status: 'ACTIVE',
                startTime: new Date()
            }, { transaction });
        }

        await transaction.commit();

        res.json({
            message: `Statut mis à jour en ${status}.`,
            appointment,
            teleconsultation,
            videoSession
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Erreur transactionnelle :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut.' });
    }
});

module.exports = router;
