const prisma = require("../../config/prismaClient");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
    try {
        console.log("🚀 Running createAdmin script...");

        const adminEmail = "df.madhoui@esi-sba.dz"; 
        const hashedPassword = await bcrypt.hash("AdminPass123!", 12);

        const admin = await prisma.user.upsert({
            where: { email: adminEmail },  // ✅ Now Prisma can check for an existing user
            update: {},  // If user exists, don't update anything
            create: {
                matricule: 202238467806,
                firstName: "Admin",
                lastName: "User",
                email: adminEmail,
                phoneNumber: "0799750495",
                roleName: "Admin", 
                password: hashedPassword,
            },
        });

        console.log("✅ Admin user created or already exists:", admin);
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Database connection closed.");
    }
};

createAdmin();
