const express = require('express');
const router = express.Router();
const { ChatThread, ChatParticipant, ChatMessage, ChatAttachment, User, TeleConsultation } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

// 🔹 Créer un nouveau thread
router.post('/threads', async (req, res) => {
    try {
        const { teleconsultationId, createdBy } = req.body;

        if (!createdBy) {
            return res.status(400).json({ error: 'createdBy invalide', details: 'UUID requis' });
        }

        const thread = await ChatThread.create({
            createdBy,
            teleconsultationId: teleconsultationId || null
        });

        res.status(201).json(thread);
    } catch (err) {
        res.status(500).json({ error: 'Erreur création thread', details: err.message });
    }
});


// 🔹 Ajouter un participant à un thread
router.post('/threads/:id/participants', async (req, res) => {
    try {
        const { userId } = req.body;
        const participant = await ChatParticipant.create({
            threadId: req.params.id,
            userId
        });
        res.status(201).json(participant);
    } catch (err) {
        res.status(500).json({ error: 'Erreur ajout participant', details: err.message });
    }
});

// 🔹 Récupérer les participants d’un thread
router.get('/threads/:id/participants', async (req, res) => {
    try {
        const participants = await ChatParticipant.findAll({
            where: { threadId: req.params.id },
            include: [{ model: User, as: 'user' }]
        });
        res.json(participants);
    } catch (err) {
        res.status(500).json({ error: 'Erreur récupération participants', details: err.message });
    }
});

// 🔹 Envoyer un message
router.post('/threads/:id/messages', async (req, res) => {
    try {
        const { senderId, message, messageType } = req.body;
        const msg = await ChatMessage.create({
            threadId: req.params.id,
            senderId,
            message,
            messageType: messageType || 'TEXT'
        });
        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json({ error: 'Erreur envoi message', details: err.message });
    }
});

// 🔹 Récupérer les messages d’un thread
router.get('/threads/:id/messages', async (req, res) => {
    try {
        const messages = await ChatMessage.findAll({
            where: { threadId: req.params.id },
            include: [{ model: User, as: 'sender' }],
            order: [['sentAt', 'ASC']]
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Erreur récupération messages', details: err.message });
    }
});

// 🔹 Récupérer les threads liés à une téléconsultation
router.get('/teleconsultation/:id/thread', async (req, res) => {
    try {
        const thread = await ChatThread.findOne({
            where: { teleconsultationId: req.params.id },
            include: [{ model: TeleConsultation, as: 'TeleConsultation' }]
        });
        if (!thread) return res.status(404).json({ error: 'Thread non trouvé' });
        res.json(thread);
    } catch (err) {
        res.status(500).json({ error: 'Erreur récupération thread', details: err.message });
    }
});

// 🔹 Upload d’un fichier (attachement)
router.post('/messages/:id/attachments', async (req, res) => {
    try {
        const { fileUrl, fileType } = req.body;
        const attachment = await ChatAttachment.create({
            messageId: req.params.id,
            fileUrl,
            fileType: fileType || 'IMAGE'
        });
        res.status(201).json(attachment);
    } catch (err) {
        res.status(500).json({ error: 'Erreur upload fichier', details: err.message });
    }
});

router.get('/threads/between/:userA/:userB', async (req, res) => {
    const { userA, userB } = req.params;

    try {
        const threads = await ChatThread.findAll({
            include: [{
                model: ChatParticipant,
                as: 'participants',
                where: {
                    userId: [userA, userB]
                },
                required: true
            }]
        });

        const validThread = threads.find(thread => {
            if (!Array.isArray(thread.participants)) return false;
            const participantIds = thread.participants?.map(p => p.userId) || [];
            return participantIds.includes(userA) &&
                participantIds.includes(userB) &&
                participantIds.length === 2;
        });


        if (validThread) {
            return res.json(validThread);
        } else {
            return res.status(404).json({ message: 'No thread found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Erreur recherche thread', details: err.message });
    }
});

module.exports = router;
