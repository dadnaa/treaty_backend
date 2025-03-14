const express = require("express");
const { deletePatient,  createPatient,updatePatient } = require("../controllers/patientController");

const router = express.Router();

router.delete("/:matricule", deletePatient); 
router.post("/create", createPatient);
router.put("/:matricule", updatePatient);// ✅ Correction du chemin

module.exports = router;
