const prisma = require("../../config/prismaClient");
const ExcelJS = require("exceljs");
const { logError } = require("../utils/errorLogger");
const generatePassword = require("../utils/passwordGenerator");
const sendEmail = require("../../config/mailer");
const fs = require("fs");
const path = require("path");

const importUsers = async () => {
      const filePath = "../uploads/users.xlsx";
    console.log("📂 Import Users script started...");
    if (!fs.existsSync(filePath)) {
        console.error("❌ No file found.");
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];

        const updatedWorkbook = new ExcelJS.Workbook();
        const updatedWorksheet = updatedWorkbook.addWorksheet("Users");

        updatedWorksheet.addRow([
            "Matricule", "First Name", "Last Name", "Email", "Phone", "Role", "Professional Status",
            "Specialization", "Years of Experience", "Year of Study", "Job Title", "Status", "Generated Password"
        ]);

        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            const matricule = row.getCell(1).value;
            const firstName = String(row.getCell(2).value).trim();
            const lastName = String(row.getCell(3).value).trim();
            const email = String(row.getCell(4).value).trim();
            const phoneNumber = String(row.getCell(5).value).trim();
            const role = String(row.getCell(6).value).trim();
            const professionalStatus = String(row.getCell(7).value).trim();
            const specialization = String(row.getCell(8).value).trim();
            const yearsOfExperience = String(row.getCell(9).value).trim();
            const yearOfStudy = row.getCell(10).value;
            const jobTitle = String(row.getCell(11).value).trim();
            console.log(`Processing row ${i}: ${row.getCell(4).value}`);

            // Validate email format
            const emailRegex = /^[a-zA-Z]{1,2}\.[a-zA-Z]+@esi-sba\.dz$/;
            if (!emailRegex.test(email)) {
                logError(`Invalid email: ${email}`);
                row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0000" } };
                continue;
            }

            // Role-specific validation
            if (role === "Doctor" && (!specialization || !yearsOfExperience)) {
                logError(`Missing doctor details for ${email}`);
                row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0000" } };
                continue;
            }

            if (role === "Patient" && !professionalStatus) {
                logError(`Missing professional status for ${email}`);
                row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0000" } };
                continue;
            }

            if (role === "Patient" && professionalStatus === "Student" && !yearOfStudy) {
                logError(`Missing year of study for student ${email}`);
                row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0000" } };
                continue;
            }

            if (role === "Patient" && professionalStatus === "Employee" && !jobTitle) {
                logError(`Missing job title for employee ${email}`);
                row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0000" } };
                continue;
            }

            try {
                // Check for duplicate matricule or email
                const existingUser = await prisma.user.findFirst({
                    where: { OR: [{ matricule }, { email }] },
                });

                if (existingUser) {
                    logError(`Duplicate entry: ${email} or Matricule: ${matricule}`);
                    updatedWorksheet.addRow([matricule, firstName, lastName, email, phoneNumber, role, "Error: Duplicate entry"]);
                    continue;
                }

                // Ensure only one active doctor exists
                if (role === "Doctor") {
                    const activeDoctor = await prisma.user.findFirst({
                        where: {   roleName: "Doctor", accountStatus: "ACTIVE" },
                    });

                    if (activeDoctor) {
                        logError(`❌ Active doctor already exists: ${activeDoctor.email}. Skipping ${email}`);
                        updatedWorksheet.addRow([matricule, firstName, lastName, email, phoneNumber, role, "Error: Active doctor exists"]);
                        continue;
                    }
                }

                // Generate password
                const { plainPassword, hashedPassword } = await generatePassword();

                // Insert user
                await prisma.user.create({
                    data: {
                        matricule,
                        firstName,
                        lastName,
                        email,
                        phoneNumber,
                        roleName :role,
                        password: hashedPassword,
                        patient: {
                            create: 
                                professionalStatus === "Student"
                                    ? { student: { create: { yearOfStudy } } } 
                                    : professionalStatus === "Employee"
                                    ? { employee: { create: { jobTitle } } } 
                                    : undefined
                        },
                        doctor: role === "Doctor" ? { create: { specialization, yearsOfExperience } } : undefined,         },
                });

                updatedWorksheet.addRow([matricule, firstName, lastName, email, phoneNumber, role, professionalStatus, specialization, yearsOfExperience, yearOfStudy, jobTitle, "Success", plainPassword]);
            } catch (error) {
                logError(`Error creating user ${email}: ${error.message}`);
                row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0000" } };
            }
        }

        const updatedFilePath = "../exports/UpdatedUsers.xlsx";
        await updatedWorkbook.xlsx.writeFile(updatedFilePath);

       await sendEmail([updatedFilePath, "../exports/errors.log"]);
        console.log("📤 Import Users script completed successfully.");
    } catch (error) {
        console.error(`❌ Error during import: ${error.message}`);
    }
};

module.exports = importUsers;
importUsers();