const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// ✅ Créer un directeur
exports.createDirecteur = async (req, res) => {
    try {
        const { matricule, firstName, lastName, email, phoneNumber, password } = req.body;

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé !" });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Trouver l'ID du rôle "directeur"
        const directeurRole = await prisma.role.findUnique({ where: { name: "directeur" } });
        if (!directeurRole) {
            return res.status(500).json({ message: "Le rôle directeur n'existe pas !" });
        }

        // Créer le directeur avec le mot de passe haché
        const newDirecteur = await prisma.user.create({
            data: {
                matricule,
                firstName,
                lastName,
                email,
                phoneNumber,
                password: hashedPassword, // ✅ Ajout du mot de passe haché
                roleId: directeurRole.id, // Associer le rôle directeur
            },
        });

        res.status(201).json({ message: "Directeur créé avec succès !", user: newDirecteur });
    } catch (error) {
        console.error("❌ Erreur lors de la création du directeur :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Supprimer un directeur
exports.deleteDirecteur = async (req, res) => {
    try {
        const { matricule } = req.params;

        // Vérifier si le directeur existe
        const existingDirecteur = await prisma.user.findUnique({ where: { matricule } });
        if (!existingDirecteur) {
            return res.status(404).json({ message: "Directeur non trouvé !" });
        }

        // Vérifier si l'utilisateur a bien le rôle "directeur"
        const role = await prisma.role.findUnique({ where: { id: existingDirecteur.roleId } });
        if (!role || role.name !== "directeur") {
            return res.status(400).json({ message: "L'utilisateur n'est pas un directeur !" });
        }

        // Supprimer le directeur
        await prisma.user.delete({ where: { matricule } });

        res.status(200).json({ message: "Directeur supprimé avec succès !" });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression du directeur :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.updateDirecteur = async (req, res) => {
    try {
        const { matricule } = req.params; // Récupérer le matricule depuis l'URL
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        // Vérifier si le directeur existe
        const existingDirecteur = await prisma.user.findUnique({ where: { matricule } });
        if (!existingDirecteur) {
            return res.status(404).json({ message: "Directeur non trouvé !" });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email && email !== existingDirecteur.email) {
            const emailExists = await prisma.user.findUnique({ where: { email } });
            if (emailExists) {
                return res.status(400).json({ message: "Email déjà utilisé par un autre utilisateur !" });
            }
        }

        // Hacher le mot de passe s'il est mis à jour
        let hashedPassword = existingDirecteur.password; // Conserver l'ancien mot de passe par défaut
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Mettre à jour le directeur
        const updatedDirecteur = await prisma.user.update({
            where: { matricule },
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                password: hashedPassword,
            },
        });

        res.status(200).json({ message: "Directeur mis à jour avec succès !", user: updatedDirecteur });
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du directeur :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
