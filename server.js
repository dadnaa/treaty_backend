require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./config/prismaClient");
const importUsers = require("./config/importUsers");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/import-users", async (req, res) => {
    try {
        await importUsers();
        res.status(200).json({ message: "Users imported successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
