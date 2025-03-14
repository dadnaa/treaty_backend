const bcrypt = require("bcryptjs");

const generatePassword = async () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
    let plainPassword = "";
    for (let i = 0; i < 16; i++) {
        plainPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 12); // Increased salt rounds to 12 for better security

    return { plainPassword, hashedPassword };
};

module.exports = generatePassword;
