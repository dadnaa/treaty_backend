-- CreateTable
CREATE TABLE "User" (
    "matricule" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photo" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("matricule")
);

-- CreateTable
CREATE TABLE "PatientInfo" (
    "id" SERIAL NOT NULL,
    "userMatricule" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "PatientInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" SERIAL NOT NULL,
    "patientMatricule" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PatientInfo_userMatricule_key" ON "PatientInfo"("userMatricule");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_patientMatricule_key" ON "MedicalRecord"("patientMatricule");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInfo" ADD CONSTRAINT "PatientInfo_userMatricule_fkey" FOREIGN KEY ("userMatricule") REFERENCES "User"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientMatricule_fkey" FOREIGN KEY ("patientMatricule") REFERENCES "PatientInfo"("userMatricule") ON DELETE RESTRICT ON UPDATE CASCADE;
