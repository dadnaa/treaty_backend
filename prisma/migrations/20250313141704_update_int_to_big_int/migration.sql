/*
  Warnings:

  - The primary key for the `Doctor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EmployeePatient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Patient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StudentPatient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_matricule_fkey";

-- DropForeignKey
ALTER TABLE "EmployeePatient" DROP CONSTRAINT "EmployeePatient_matricule_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_matricule_fkey";

-- DropForeignKey
ALTER TABLE "StudentPatient" DROP CONSTRAINT "StudentPatient_matricule_fkey";

-- AlterTable
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_pkey",
ALTER COLUMN "matricule" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY ("matricule");

-- AlterTable
ALTER TABLE "EmployeePatient" DROP CONSTRAINT "EmployeePatient_pkey",
ALTER COLUMN "matricule" SET DATA TYPE BIGINT,
ADD CONSTRAINT "EmployeePatient_pkey" PRIMARY KEY ("matricule");

-- AlterTable
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_pkey",
ALTER COLUMN "matricule" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Patient_pkey" PRIMARY KEY ("matricule");

-- AlterTable
ALTER TABLE "StudentPatient" DROP CONSTRAINT "StudentPatient_pkey",
ALTER COLUMN "matricule" SET DATA TYPE BIGINT,
ADD CONSTRAINT "StudentPatient_pkey" PRIMARY KEY ("matricule");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "matricule" SET DATA TYPE BIGINT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("matricule");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_matricule_fkey" FOREIGN KEY ("matricule") REFERENCES "User"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_matricule_fkey" FOREIGN KEY ("matricule") REFERENCES "User"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPatient" ADD CONSTRAINT "StudentPatient_matricule_fkey" FOREIGN KEY ("matricule") REFERENCES "Patient"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePatient" ADD CONSTRAINT "EmployeePatient_matricule_fkey" FOREIGN KEY ("matricule") REFERENCES "Patient"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;
