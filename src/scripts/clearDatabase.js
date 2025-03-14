const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    await prisma.medicalRecord.deleteMany({});
    await prisma.patientInfo.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("Toutes les tables ont été vidées !");
  } catch (error) {
    console.error("Erreur lors du vidage des tables :", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
