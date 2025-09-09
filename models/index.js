const sequelize = require('../config/db');
const UserModel = require('./User');
const DoctorModel = require('./Doctor');
const MedicalSpecialtyModel = require('./MedicalSpecialty');

const User = UserModel(sequelize);
const Doctor = DoctorModel(sequelize);
const MedicalSpecialty = MedicalSpecialtyModel(sequelize);

// Associations si nécessaire
Doctor.belongsTo(User, { foreignKey: 'user_id' });
Doctor.belongsTo(MedicalSpecialty, { foreignKey: 'specialty_id' });

module.exports = {
  sequelize,
  User,
  Doctor,
  MedicalSpecialty,
};
