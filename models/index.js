const sequelize = require('../config/db');

// Modèles existants
const UserModel = require('./User');
const DoctorModel = require('./Doctor');
const MedicalSpecialtyModel = require('./MedicalSpecialty');
const AppointmentModel = require('./Appointment');
const VideoSessionModel = require('./VideoSession');
const TeleconsultationModel = require('./TeleConsultation');
const PrescriptionModel = require('./Prescription');

// Modèles du chat
const ChatThreadModel = require('./ChatThread');
const ChatParticipantModel = require('./ChatParticipant');
const ChatMessageModel = require('./ChatMessage');
const ChatAttachmentModel = require('./ChatAttachment');

// Instanciation
const User = UserModel(sequelize);
const Doctor = DoctorModel(sequelize);
const MedicalSpecialty = MedicalSpecialtyModel(sequelize);
const Appointment = AppointmentModel(sequelize);
const TeleConsultation = TeleconsultationModel(sequelize);
const VideoSession = VideoSessionModel(sequelize);
const Prescription = PrescriptionModel(sequelize);

const ChatThread = ChatThreadModel(sequelize);
const ChatParticipant = ChatParticipantModel(sequelize);
const ChatMessage = ChatMessageModel(sequelize);
const ChatAttachment = ChatAttachmentModel(sequelize);

// Associations existantes
User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });
Doctor.belongsTo(MedicalSpecialty, { foreignKey: 'specialty_id' });

Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'Doctor', foreignKey: 'doctorId' });

TeleConsultation.belongsTo(Appointment, { foreignKey: 'appointmentId' });
TeleConsultation.hasOne(VideoSession, { foreignKey: 'teleconsultationId', as: 'VideoSession' });
VideoSession.belongsTo(TeleConsultation, { foreignKey: 'teleconsultationId' });

Prescription.belongsTo(TeleConsultation, { foreignKey: 'teleconsultationId', as: 'Teleconsultation' });
TeleConsultation.hasMany(Prescription, { foreignKey: 'teleconsultationId', as: 'Prescriptions' });

// Associations du chat
ChatThread.belongsTo(TeleConsultation, { foreignKey: 'teleconsultationId', as: 'TeleConsultation' });
ChatThread.hasMany(ChatMessage, { foreignKey: 'threadId', as: 'messages' });
ChatThread.hasMany(ChatParticipant, { foreignKey: 'threadId', as: 'participants' });

ChatParticipant.belongsTo(ChatThread, { foreignKey: 'threadId', as: 'thread' });
ChatParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ChatMessage.belongsTo(ChatThread, { foreignKey: 'threadId', as: 'thread' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
ChatMessage.hasMany(ChatAttachment, { foreignKey: 'messageId', as: 'attachments' });

ChatAttachment.belongsTo(ChatMessage, { foreignKey: 'messageId', as: 'message' });

// Export
module.exports = {
  sequelize,
  User,
  Doctor,
  MedicalSpecialty,
  Appointment,
  TeleConsultation,
  VideoSession,
  Prescription,
  ChatThread,
  ChatParticipant,
  ChatMessage,
  ChatAttachment
};
