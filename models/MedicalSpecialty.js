// models/MedicalSpecialty.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MedicalSpecialty = sequelize.define(
    "MedicalSpecialty",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      specialtyName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "specialty_name",
      },
      createdAt: { type: DataTypes.DATE, field: "created_at" },
    },
    {
      tableName: "medical_specialties",
      timestamps: false,
    }
  );

  MedicalSpecialty.associate = (models) => {
    MedicalSpecialty.hasMany(models.Doctor, {
      foreignKey: "specialtyId",
    });
  };

  return MedicalSpecialty;
};
