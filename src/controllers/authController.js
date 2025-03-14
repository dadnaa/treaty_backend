const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient"); // Assure-toi d'importer Prisma correctement

const SECRET_KEY = "your_secret_key"; // 🔒 Mets cette clé dans un fichier .env

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect !" });
        }

        // Vérifier si le rôle sélectionné correspond
        if (user.role.name !== role) {
            return res.status(403).json({ message: "Accès refusé pour ce rôle !" });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect !" });
        }

        // Générer le token JWT
        const token = jwt.sign(
            { matricule: user.matricule, role: user.role.name },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Connexion réussie !",
            token,
            user: {
                matricule: user.matricule,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role.name,
            },
        });
    } catch (error) {
        console.error("❌ Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
