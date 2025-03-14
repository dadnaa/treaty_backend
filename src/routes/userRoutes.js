const { createPatient, createAdmin, createDirecteur } = require("../controllers/userController");
const express = require("express");
const router = express.Router();


router.post("/create-admin", createAdmin);
// ✅ Nouvelle route pour créer un directeur

module.exports = router;
