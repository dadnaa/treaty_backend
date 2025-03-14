const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const generatePassword = async () => {
    const plainPassword = crypto.randomBytes(12).toString("base64").slice(0, 16);
    const hashedPassword = await bcrypt.hash(plainPassword, 12); // Increased salt rounds

    return { plainPassword, hashedPassword };
};

module.exports = generatePassword;

