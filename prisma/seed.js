const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { id: 1, name: "patient" },
    { id: 2, name: "directeur" },
    { id: 3, name: "admin" }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  console.log("✅ Table Role remplie avec succès !");
}

main()
  .catch((e) => {
    console.error("Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
