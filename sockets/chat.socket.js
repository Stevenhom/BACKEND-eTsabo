const { ChatMessage, ChatThread, User } = require('../models');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('[SOCKET] Nouveau client connecté');

    // 🔹 Authentification (optionnel mais recommandé)
    const userId = socket.handshake.auth?.userId;
    if (!userId) {
      console.log('[SOCKET] Connexion refusée : userId manquant');
      return socket.disconnect();
    }

    // 🔹 Rejoindre un thread
    socket.on('joinThread', (threadId) => {
      socket.join(threadId);
      console.log(`[SOCKET] User ${userId} a rejoint le thread ${threadId}`);
    });

    // 🔹 Envoyer un message
    socket.on('sendMessage', async ({ threadId, message, messageType }) => {
      try {
        const msg = await ChatMessage.create({
          threadId,
          senderId: userId,
          message,
          messageType: messageType || 'TEXT'
        });

        const fullMsg = await ChatMessage.findByPk(msg.id, {
          include: [{ model: User, as: 'sender' }]
        });

        io.to(threadId).emit('newMessage', fullMsg);
      } catch (err) {
        console.error('[SOCKET] Erreur envoi message :', err.message);
      }
    });

    // 🔹 Déconnexion
    socket.on('disconnect', () => {
      console.log(`[SOCKET] Déconnexion user ${userId}`);
    });
  });
};
