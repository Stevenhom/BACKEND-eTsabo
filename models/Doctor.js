// models/Doctor.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Doctor = sequelize.define(
    "Doctor",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, unique: true, allowNull: false, field: "user_id" },
      licenseNumber: { type: DataTypes.STRING, unique: true, allowNull: false, field: "license_number" },
      experienceYears: { type: DataTypes.INTEGER, field: "experience_years" },
      specialtyId: { type: DataTypes.UUID, allowNull: false, field: "specialty_id" },
      consultationFee: { type: DataTypes.DECIMAL(10, 2), field: "consultation_fee" },
      createdAt: { type: DataTypes.DATE, field: "created_at" },
    },
    {
      tableName: "doctors",
      timestamps: false,
    }
  );

  Doctor.associate = (models) => {
    Doctor.belongsTo(models.User, { foreignKey: "userId" });
    Doctor.belongsTo(models.MedicalSpecialty, { foreignKey: "specialtyId" });
  };

  return Doctor;
};
