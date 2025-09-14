const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const VideoSession = sequelize.define('VideoSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    teleconsultationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'teleconsultation_id'
    },
    roomName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'room_name'
    },
    startTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'start_time'
    },
    endTime: {
      type: DataTypes.DATE,
      field: 'end_time'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'ACTIVE',
      validate: {
        isIn: [['ACTIVE', 'ENDED', 'CANCELED']]
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'video_sessions',
    timestamps: false
  });

  VideoSession.associate = (models) => {
    VideoSession.belongsTo(models.Teleconsultation, {
      foreignKey: 'teleconsultationId',
      as: 'Teleconsultation'
    });
  };

  return VideoSession;
};
