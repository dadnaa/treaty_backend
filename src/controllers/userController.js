const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();



  

//Create Admin
exports.createAdmin = async (req, res) => {
    try {
        const { matricule, firstName, lastName, email, phoneNumber, password } = req.body;

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé !" });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Trouver l'ID du rôle "admin"
        const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
        if (!adminRole) {
            return res.status(500).json({ message: "Le rôle admin n'existe pas !" });
        }

        // Créer l'utilisateur admin avec le mot de passe haché
        const newAdmin = await prisma.user.create({
            data: {
                matricule,
                firstName,
                lastName,
                email,
                phoneNumber,
                password: hashedPassword, // ✅ Ajout du mot de passe haché
                roleId: adminRole.id, // Associer le rôle admin
            },
        });

        res.status(201).json({ message: "Admin créé avec succès !", user: newAdmin });
    } catch (error) {
        console.error("❌ Erreur lors de la création de l'admin :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
//// Create Directeur
