const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Appointment = sequelize.define(
    "Appointment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "patient_id",
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "doctor_id",
      },
      appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "appointment_date",
      },
      isEmergency: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_emergency",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "description",
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "REQUESTED",
        validate: {
          isIn: [["REQUESTED", "SCHEDULED", "COMPLETED", "CANCELED"]],
        },
        field: "status",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
    },
    {
      tableName: "appointments",
      timestamps: false,
    }
  );

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, {
      as: "Patient",
      foreignKey: "patientId",
    });
    Appointment.belongsTo(models.User, {
      as: "Doctor",
      foreignKey: "doctorId",
    });
  };

  return Appointment;
};
