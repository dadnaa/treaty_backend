const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "../exports/errors.log");

const logError = (message) => {
    const errorMessage = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logFilePath, errorMessage, "utf8");
};

module.exports = { logError };
