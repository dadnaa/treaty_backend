require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes"); // Ajout des routes patients
const prisma = new PrismaClient();
const app = express();

//  Middleware
app.use(cors());
app.use(express.json());

//  Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes); 
const directeurRoutes = require("./routes/directeurRoutes");
app.use("/api/directeur", directeurRoutes);

     // Ajout de la gestion des patients

//  Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur:", err);
  res.status(500).json({ message: "Erreur serveur" });
});

//  Écoute du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;
