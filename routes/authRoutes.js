// routes/authRoute.js

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Doctor } = require('../models'); 
const { upload, uploadPath } = require("../middlewares/multerMiddleware");
const fs = require("fs");
const { Op } = require("sequelize");

const path = require("path");

// Définition des types d’utilisateurs (enum côté back)
const USER_TYPES = {
  PATIENT: 1,
  DOCTOR: 2,
  ADMIN: 3,
};

// INSCRIPTION PATIENT
router.post("/patient", async (req, res) => {
  console.log("📥 Nouvelle requête POST /patient");
  console.log("Données reçues:", req.body);

  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
    profilePicture,
    // Champs supplémentaires pour docteur
    licenseNumber,
    experienceYears,
    specialtyId,
    consultationFee,
  } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    // Vérifier si email ou téléphone déjà utilisé
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phoneNumber }] },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone number already used" });
    }

    // Créer l'utilisateur
    const newUser = await User.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      role,
      profilePicture: profilePicture || null,
    });

    // Si c’est un DOCTOR → on remplit aussi doctors
    if (role === "doctor") {
      if (!licenseNumber || !specialtyId) {
        return res.status(400).json({
          message: "Doctors must provide licenseNumber and specialtyId",
        });
      }

      await Doctor.create({
        userId: newUser.id,
        licenseNumber,
        experienceYears: experienceYears || 0,
        specialtyId,
        consultationFee: consultationFee || 0,
        createdAt: new Date(),
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      message: "User created successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
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
