const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
exports.deletePatient = async (req, res) => {
    try {
        const { matricule } = req.params;

        // Vérifier si le patient existe
        const existingPatient = await prisma.user.findUnique({ where: { matricule } });
        if (!existingPatient) {
            return res.status(404).json({ message: "Patient non trouvé !" });
        }

        // Transaction pour supprimer les données liées
        await prisma.$transaction(async (prisma) => {
            // Supprimer le dossier médical
            await prisma.medicalRecord.deleteMany({ where: { patientMatricule: matricule } });

            // Supprimer les infos du patient
            await prisma.patientInfo.deleteMany({ where: { userMatricule: matricule } });

            // Supprimer le patient
            await prisma.user.delete({ where: { matricule } });
        });

        res.status(200).json({ message: "Patient supprimé avec succès !" });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression du patient :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.createPatient = async (req, res) => {
    try {
        const { matricule, firstName, lastName, email, phoneNumber, password, status } = req.body;

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé !" });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Trouver l'ID du rôle "patient"
        const patientRole = await prisma.role.findUnique({ where: { name: "patient" } });
        if (!patientRole) {
            return res.status(500).json({ message: "Le rôle patient n'existe pas !" });
        }

        // Transaction pour créer le patient, PatientInfo et MedicalRecord
        const newUser = await prisma.$transaction(async (prisma) => {
            // Créer le patient
            const createdUser = await prisma.user.create({
                data: {
                    matricule,
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    password: hashedPassword,
                    roleId: patientRole.id,
                },
            });

            // Créer les infos du patient
            const createdPatientInfo = await prisma.patientInfo.create({
                data: {
                    userMatricule: createdUser.matricule,
                    status: status || "student", // Par défaut "student" si non spécifié
                },
            });

            // Créer le dossier médical
            const createdMedicalRecord = await prisma.medicalRecord.create({
                data: {
                    patientMatricule: createdUser.matricule,
                    details: "Dossier médical initialisé",
                },
            });

            return { createdUser, createdPatientInfo, createdMedicalRecord };
        });

        res.status(201).json({ 
            message: "Patient créé avec succès !", 
            user: newUser.createdUser, 
            patientInfo: newUser.createdPatientInfo,
            medicalRecord: newUser.createdMedicalRecord
        });
    } catch (error) {
        console.error("❌ Erreur lors de la création du patient :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.updatePatient = async (req, res) => {
    try {
        const { matricule } = req.params;
        const { firstName, lastName, email, phoneNumber, password, status } = req.body;

        // Vérifier si le patient existe
        const existingPatient = await prisma.user.findUnique({ where: { matricule } });
        if (!existingPatient) {
            return res.status(404).json({ message: "Patient non trouvé !" });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email && email !== existingPatient.email) {
            const emailExists = await prisma.user.findUnique({ where: { email } });
            if (emailExists) {
                return res.status(400).json({ message: "Email déjà utilisé par un autre utilisateur !" });
            }
        }

        // Hacher le mot de passe s'il est mis à jour
        let hashedPassword = existingPatient.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Mettre à jour les informations du patient
        const updatedPatient = await prisma.user.update({
            where: { matricule },
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                password: hashedPassword,
            },
        });

        // Mettre à jour le statut du patient dans `patientInfo`
        const updatedPatientInfo = await prisma.patientInfo.updateMany({
            where: { userMatricule: matricule },
            data: { status },
        });

        res.status(200).json({ 
            message: "Patient mis à jour avec succès !", 
            user: updatedPatient, 
            patientInfo: updatedPatientInfo
        });
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du patient :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
