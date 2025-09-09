// models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: { type: DataTypes.STRING, allowNull: false, field: 'first_name' },
    lastName: { type: DataTypes.STRING, allowNull: false, field: 'last_name' },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true, 
      validate: { isEmail: true } 
    },
    password: { type: DataTypes.STRING, allowNull: false },
    adresse: { type: DataTypes.STRING },
    birthDate: { type: DataTypes.DATE, field: 'birth_date' },
    phoneNumber: { type: DataTypes.STRING, field: 'phone_number' },
    role: { 
      type: DataTypes.ENUM('patient', 'doctor', 'pharmacy'), 
      allowNull: false 
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' }
  }, {
    tableName: 'users',
    timestamps: false, // On n’a pas updated_at
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Méthode pour comparer les mots de passe
  User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};
