const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ChatThread = sequelize.define("ChatThread", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    teleconsultationId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "teleconsultation_id"
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "created_by"
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at"
    }
  }, {
    tableName: "chat_threads",
    timestamps: false
  });

  ChatThread.associate = (models) => {
    ChatThread.hasMany(models.ChatMessage, { foreignKey: "threadId", as: "messages" });
    ChatThread.hasMany(models.ChatParticipant, { foreignKey: "threadId", as: "participants" });
    ChatThread.belongsTo(models.TeleConsultation, {
      foreignKey: "teleconsultationId",
      as: "TeleConsultation"
    });
  };

  return ChatThread;
};
