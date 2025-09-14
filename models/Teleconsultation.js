// models/teleconsultation.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Teleconsultation = sequelize.define('Teleconsultation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "appointment_id",
    },
    mode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['VIDEO', 'AUDIO', 'CHAT']]
      }
    },
    notes: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    }
  }, {
    tableName: 'teleconsultations',
    timestamps: false
  });

  Teleconsultation.associate = (models) => {
    Teleconsultation.belongsTo(models.Appointment, {
      foreignKey: 'appointmentId',
      as: "Appointment",
    });
  };

  return Teleconsultation;
};
