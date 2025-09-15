const sequelize = require('../config/db');
const UserModel = require('./User');
const DoctorModel = require('./Doctor');
const MedicalSpecialtyModel = require('./MedicalSpecialty');
const AppointmentModel = require('./Appointment');
const VideoSessionModel = require('./VideoSession');
const Teleconsultation = require('./TeleConsultation');
const PrescriptionModel = require('./Prescription');

const User = UserModel(sequelize);
const Doctor = DoctorModel(sequelize);
const MedicalSpecialty = MedicalSpecialtyModel(sequelize);
const Appointment = AppointmentModel(sequelize);
const TeleConsultation = Teleconsultation(sequelize);
const VideoSession = VideoSessionModel(sequelize);
const Prescription = PrescriptionModel(sequelize);

// Associations nécessaires pour les jointures
User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });
Doctor.belongsTo(MedicalSpecialty, { foreignKey: 'specialty_id' });
Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'Doctor', foreignKey: 'doctorId' });
TeleConsultation.belongsTo(Appointment, { foreignKey: 'appointmentId' });
VideoSession.belongsTo(TeleConsultation, { foreignKey: 'teleconsultationId' });
TeleConsultation.hasOne(VideoSession, { foreignKey: 'teleconsultationId', as: 'VideoSession' });
Prescription.belongsTo(TeleConsultation, { foreignKey: 'teleconsultationId', as: 'Teleconsultation' });
TeleConsultation.hasMany(Prescription, { foreignKey: 'teleconsultationId', as: 'Prescriptions' });

module.exports = {
  sequelize,
  User,
  Doctor,
  MedicalSpecialty,
  Appointment,
  TeleConsultation,
  VideoSession,
  Prescription
};
