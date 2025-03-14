const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key"; // Mets cette clé dans .env

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Accès refusé. Aucun token fourni." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};
