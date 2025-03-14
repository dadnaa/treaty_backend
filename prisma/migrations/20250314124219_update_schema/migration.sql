-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_patientMatricule_fkey";

-- DropForeignKey
ALTER TABLE "PatientInfo" DROP CONSTRAINT "PatientInfo_userMatricule_fkey";

-- AddForeignKey
ALTER TABLE "PatientInfo" ADD CONSTRAINT "PatientInfo_userMatricule_fkey" FOREIGN KEY ("userMatricule") REFERENCES "User"("matricule") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientMatricule_fkey" FOREIGN KEY ("patientMatricule") REFERENCES "PatientInfo"("userMatricule") ON DELETE CASCADE ON UPDATE CASCADE;
