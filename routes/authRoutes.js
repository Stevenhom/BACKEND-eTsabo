// routes/authRoute.js

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Doctor } = require('../models'); 
const { upload, resolveUploadPath } = require("../middlewares/multerMiddleware");
const fs = require("fs");
const { Op } = require("sequelize");

const path = require("path");

// Définition des types d’utilisateurs (enum côté back)
const USER_TYPES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  PHARMACY: 'PHARMACY',
};

// INSCRIPTION PATIENT/DOCTOR avec upload photo de profil
router.post("/user", upload.single("profilePicture"), async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
    licenseNumber,
    experienceYears,
    specialtyId,
    consultationFee
  } = req.body;

  if (!password) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Password is required" });
  }

  const transaction = await User.sequelize.transaction();
  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phoneNumber }] }
    });

    if (existingUser) {
      if (req.file) fs.unlinkSync(req.file.path);
      await transaction.rollback();
      return res.status(400).json({ message: "Email or phone number already used" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      role
    }, { transaction });

    // Renommage du fichier uploadé si photo de profil
    let profilePicturePath = null;
    if (req.file && req.query.uploadType === "profile") {
      const ext = path.extname(req.file.originalname);
      const newFileName = `${newUser.id}${ext}`;
      const newPath = path.join(resolveUploadPath("profile"), newFileName);

      fs.renameSync(req.file.path, newPath);
      profilePicturePath = path.relative(path.resolve(), newPath).replace(/\\/g, "/");

      await newUser.update({ profilePicture: profilePicturePath }, { transaction });
    }

    // Si DOCTOR → créer l’entrée dans doctors
    if (role.toLowerCase() === "doctor") {
      if (!licenseNumber || !specialtyId) {
        if (req.file) fs.unlinkSync(req.file.path);
        await transaction.rollback();
        return res.status(400).json({
          message: "Doctors must provide licenseNumber and specialtyId"
        });
      }

      await Doctor.create({
        userId: newUser.id,
        licenseNumber,
        experienceYears: experienceYears || 0,
        specialtyId,
        consultationFee: consultationFee || 0,
        createdAt: new Date()
      }, { transaction });
    }

    await transaction.commit();

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      message: "User created successfully",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    if (transaction) await transaction.rollback();
    console.error("❌ Erreur lors de l’inscription :", error);
    res.status(500).json({ message: "Server error" });
  }
});

// CONNEXION
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe invalide" });
    }

    // Vérifier si user.password est bien une string
    if (typeof user.password !== "string") {
      return res.status(500).json({
        message: "Erreur serveur : problème avec le hash du mot de passe",
      });
    }

    // Vérifier le mot de passe avec la méthode du modèle
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe invalide" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    // Supprimer le password du retour
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
