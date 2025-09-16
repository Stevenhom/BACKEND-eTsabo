const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ChatParticipant = sequelize.define("ChatParticipant", {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id"
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "joined_at"
    }
  }, {
    tableName: "chat_participants",
    timestamps: false
  });

  ChatParticipant.associate = (models) => {
    ChatParticipant.belongsTo(models.ChatThread, {
      foreignKey: "threadId",
      as: "thread"
    });
    ChatParticipant.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user"
    });
  };

  return ChatParticipant;
};
