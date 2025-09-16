const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ChatAttachment = sequelize.define("ChatAttachment", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "message_id"
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "file_url"
    },
    fileType: {
      type: DataTypes.STRING(20),
      defaultValue: "IMAGE",
      field: "file_type",
      validate: {
        isIn: [["IMAGE", "PDF", "DOCUMENT", "OTHER"]]
      }
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "uploaded_at"
    }
  }, {
    tableName: "chat_attachments",
    timestamps: false
  });

  ChatAttachment.associate = (models) => {
    ChatAttachment.belongsTo(models.ChatMessage, {
      foreignKey: "messageId",
      as: "message"
    });
  };

  return ChatAttachment;
};
