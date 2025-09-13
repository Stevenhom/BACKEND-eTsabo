const sequelize = require('../config/db');
const UserModel = require('./User');
const DoctorModel = require('./Doctor');
const MedicalSpecialtyModel = require('./MedicalSpecialty');
const AppointmentModel = require('./Appointment');

const User = UserModel(sequelize);
const Doctor = DoctorModel(sequelize);
const MedicalSpecialty = MedicalSpecialtyModel(sequelize);
const Appointment = AppointmentModel(sequelize);


// Associations nécessaires pour les jointures
User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });
Doctor.belongsTo(MedicalSpecialty, { foreignKey: 'specialty_id' });
Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'Doctor', foreignKey: 'doctorId' });

module.exports = {
  sequelize,
  User,
  Doctor,
  MedicalSpecialty,
  Appointment
};
