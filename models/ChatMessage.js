const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ChatMessage = sequelize.define("ChatMessage", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    threadId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "thread_id"
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sender_id"
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    messageType: {
      type: DataTypes.STRING(20),
      defaultValue: "TEXT",
      field: "message_type",
      validate: {
        isIn: [["TEXT", "IMAGE", "FILE", "SYSTEM"]]
      }
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "sent_at"
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read"
    }
  }, {
    tableName: "chat_messages",
    timestamps: false
  });

  ChatMessage.associate = (models) => {
    ChatMessage.belongsTo(models.ChatThread, {
      foreignKey: "threadId",
      as: "thread"
    });
    ChatMessage.belongsTo(models.User, {
      foreignKey: "senderId",
      as: "sender"
    });
    ChatMessage.hasMany(models.ChatAttachment, {
      foreignKey: "messageId",
      as: "attachments"
    });
  };

  return ChatMessage;
};
