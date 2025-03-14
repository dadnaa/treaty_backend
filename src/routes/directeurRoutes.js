const express = require("express");
const { createDirecteur, deleteDirecteur ,updateDirecteur } = require("../controllers/directeurController");

const router = express.Router();

router.post("/create", createDirecteur); // ✅ Créer un directeur
router.delete("/:matricule", deleteDirecteur); // ✅ Supprimer un directeur
router.put("/:matricule", updateDirecteur);

module.exports = router;
