const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'prescriptions',
    timestamps: false
  });

  Prescription.associate = (models) => {
    Prescription.belongsTo(models.TeleConsultation, {
      foreignKey: 'teleconsultationId',
      as: 'TeleConsultation'
    });
  };

  return Prescription;
};
