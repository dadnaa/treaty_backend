const nodemailer = require("nodemailer");
const prisma = require("./prismaClient");
require("dotenv").config();

const sendEmail = async (filePaths) => {
    try {
        // Fetch the admin's email from the database
        const admin = await prisma.user.findFirst({
            where: { roleName: "admin" },
            select: { email: true },
        });

        if (!admin) {
            console.error("❌ No admin found in the database.");
            return;
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.ADMIN_EMAIL,
            to: "df.madhoui@esi-sba.dz",
            subject: "User Import Report",
            text: "Attached are the updated user list and error log.",
            attachments: filePaths.map((filePath) => ({
                filename: filePath.split("/").pop(),
                path: filePath,
            })),
        });

        console.log(`✅ Email sent successfully to ${admin.email}`);
    } catch (error) {
        console.error("❌ Email sending failed:", error.message);
    }
};

module.exports = sendEmail;
