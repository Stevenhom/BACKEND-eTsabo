const express = require('express');
const router = express.Router();
const { TeleConsultation, Appointment, User, VideoSession } = require('../models');
const { buildSequelizeWhere } = require('../utils/utils');

// GET /api/v1/teleconsultations
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const offset = (page - 1) * size;

        let filters = {};
        try {
            filters = req.query.filters ? JSON.parse(req.query.filters) : {};
        } catch (e) {
            console.warn('Erreur de parsing des filtres:', e);
        }

        const where = buildSequelizeWhere(filters, TeleConsultation.rawAttributes);

        const include = [
            {
                model: Appointment,
                as: 'Appointment',
                include: [
                    { model: User, as: 'Patient', attributes: ['id', 'firstName', 'lastName'] },
                    { model: User, as: 'Doctor', attributes: ['id', 'firstName', 'lastName'] }
                ]
            },
            {
                model: VideoSession,
                as: 'VideoSession'
            }
        ];

        const { count, rows } = await TeleConsultation.findAndCountAll({
            where,
            include,
            limit: size,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            items: rows,
            total: count,
            page,
            size
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des téléconsultations :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des téléconsultations.' });
    }
});

// GET /api/v1/teleconsultations/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const teleconsultation = await TeleConsultation.findByPk(id, {
            include: [
                {
                    model: Appointment,
                    as: 'Appointment',
                    include: [
                        { model: User, as: 'Patient', attributes: ['id', 'firstName', 'lastName'] },
                        { model: User, as: 'Doctor', attributes: ['id', 'firstName', 'lastName'] }
                    ]
                },
                {
                    model: VideoSession,
                    as: 'VideoSession'
                }
            ]
        });

        if (!teleconsultation) {
            return res.status(404).json({ error: 'Téléconsultation introuvable.' });
        }

        res.json({ teleconsultation });
    } catch (error) {
        console.error('Erreur lors de la récupération de la téléconsultation :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération de la téléconsultation.' });
    }
});

// GET /api/v1/teleconsultations/doctor/:doctorId
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const offset = (page - 1) * size;

        let filters = {};
        try {
            filters = req.query.filters ? JSON.parse(req.query.filters) : {};
        } catch (e) {
            console.warn('Erreur de parsing des filtres:', e);
        }

        const where = buildSequelizeWhere(filters, TeleConsultation.rawAttributes);

        const { count, rows } = await TeleConsultation.findAndCountAll({
            where,
            include: [
                {
                    model: Appointment,
                    as: 'Appointment',
                    where: { doctorId },
                    include: [
                        { model: User, as: 'Patient', attributes: ['id', 'firstName', 'lastName'] },
                        { model: User, as: 'Doctor', attributes: ['id', 'firstName', 'lastName'] }
                    ]
                },
                {
                    model: VideoSession,
                    as: 'VideoSession'
                }
            ],
            limit: size,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            items: rows,
            total: count,
            page,
            size
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des téléconsultations du médecin :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// GET /api/v1/teleconsultations/patient/:patientId
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const offset = (page - 1) * size;

        let filters = {};
        try {
            filters = req.query.filters ? JSON.parse(req.query.filters) : {};
        } catch (e) {
            console.warn('Erreur de parsing des filtres:', e);
        }

        const where = buildSequelizeWhere(filters, TeleConsultation.rawAttributes);

        const { count, rows } = await TeleConsultation.findAndCountAll({
            where,
            include: [
                {
                    model: Appointment,
                    as: 'Appointment',
                    where: { patientId },
                    include: [
                        { model: User, as: 'Patient', attributes: ['id', 'firstName', 'lastName'] },
                        { model: User, as: 'Doctor', attributes: ['id', 'firstName', 'lastName'] }
                    ]
                },
                {
                    model: VideoSession,
                    as: 'VideoSession'
                }
            ],
            limit: size,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            items: rows,
            total: count,
            page,
            size
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des téléconsultations du patient :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

module.exports = router;
