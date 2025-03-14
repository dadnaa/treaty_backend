const prisma = require("../../config/prismaClient");
const ExcelJS = require("exceljs");
const { logError } = require("../utils/errorLogger");
const generatePassword = require("../utils/passwordGenerator");
const sendEmail = require("../../config/mailer");
const fs = require("fs");

const importUsers = async () => {

    const filePath = "./users.xlsx";
    console.log("📂 Import Users script started...");

    if (!fs.existsSync(filePath)) {
        console.error("❌ No file found.");
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];

        const users = [];
        const errors = [];
        const updatedWorkbook = new ExcelJS.Workbook();
        const updatedWorksheet = updatedWorkbook.addWorksheet("Users");

        updatedWorksheet.addRow([
            "Matricule", "First Name", "Last Name", "Email", "Phone", "Role", "Professional Status",
            , "Generated Password"
        ]);

        // Extract data from Excel
        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            const excelDate = row.getCell(6).value;
            const dateOfBirth = (excelDate instanceof Date) 
                ? excelDate  
                : new Date(Number(excelDate));
            
            const user = {
                matricule: row.getCell(1).value,
                firstName: String(row.getCell(2).value).trim(),
                lastName: String(row.getCell(3).value).trim(),
                email: String(row.getCell(4).value).trim(),
                phoneNumber: String(row.getCell(5).value).trim(),
                dateOfBirth: isNaN(dateOfBirth.getTime()) ? null : dateOfBirth,
                placeOfBirth: String(row.getCell(7).value).trim(),
                address: String(row.getCell(8).value).trim(),
                gender: String(row.getCell(9).value).trim(),
                role: String(row.getCell(10).value).trim().toLowerCase(),
                professionalStatus: String(row.getCell(11).value).trim(),
                specialization: String(row.getCell(12).value).trim(),
                yearsOfExperience: row.getCell(13).value,
                yearOfStudy: row.getCell(14).value,
                jobTitle: String(row.getCell(15).value).trim(),
            };


            // Validate email
            if (!/^[a-zA-Z]{1,2}\.[a-zA-Z]+@esi-sba\.dz$/.test(user.email)) {
                errors.push({ row: i, reason: "Invalid email format", user });
                continue;
            }

            // Role-specific validation
            if (user.role === "Doctor" && (!user.specialization || !user.yearsOfExperience)) {
                errors.push({ row: i, reason: "Missing doctor details", user });
                continue;
            }

            if (user.role === "Patient" && !user.professionalStatus) {
                errors.push({ row: i, reason: "Missing professional status", user });
                continue;
            }

            if (user.role === "Patient" && user.professionalStatus === "Student" && !user.yearOfStudy) {
                errors.push({ row: i, reason: "Missing year of study", user });
                continue;
            }

            if (user.role === "Patient" && user.professionalStatus === "Employee" && !user.jobTitle) {
                errors.push({ row: i, reason: "Missing job title", user });
                continue;
            }

            users.push(user);
        }

        // **🔍 Step 1: Preload existing users**
        const existingUsers = await prisma.user.findMany({
            where: {
                OR: users.map(({ matricule, email }) => ({ matricule, email })),
            },
            select: { matricule: true, email: true },
        });

        const existingMatricules = new Set(existingUsers.map((u) => u.matricule));
        const existingEmails = new Set(existingUsers.map((u) => u.email));

        const validUsers = [];

        for (const user of users) {
            if (existingMatricules.has(user.matricule) || existingEmails.has(user.email)) {
                errors.push({ reason: "Duplicate entry", user });
                continue;
            }

            // Generate password
            const { plainPassword, hashedPassword } = await generatePassword();
            user.password = hashedPassword;
            user.generatedPassword = plainPassword;

            validUsers.push(user);
        }

        // **🔥 Step 2: Bulk insert users**
        if (validUsers.length > 0) {
            // Create users without relations
            const createdUsers = await prisma.user.createMany({
                data: validUsers.map(({ 
                    password, matricule, firstName, lastName, email, phoneNumber, 
                    dateOfBirth, placeOfBirth, address, gender, 
                    role, professionalStatus, specialization, 
                    yearsOfExperience, yearOfStudy, jobTitle 
                }) => ({
                    matricule,
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    dateOfBirth,
                    placeOfBirth,
                    address,
                    gender,
                    roleName: role,
                    password
                })),
                skipDuplicates: true,
            });
        
            // After users are created, now create doctor or patient relations
            for (const user of validUsers) {
                if (user.role === "doctor") {
                    await prisma.doctor.create({
                        data: {
                            userId: user.matricule,
                            specialization: user.specialization,
                            yearsOfExperience: user.yearsOfExperience,
                        }
                    });
                } else if (user.role === "patient") {
                    await prisma.patient.create({
                        data: {
                            userId: user.matricule,
                            student: user.professionalStatus === "Student"
                                ? { create: { yearOfStudy: user.yearOfStudy } }
                                : undefined,
                            employee: user.professionalStatus === "Employee"
                                ? { create: { jobTitle: user.jobTitle } }
                                : undefined
                        }
                    });
                }
            }
        }
        

        // **📤 Step 3: Log errors and generate report**
        for (const { reason, user } of errors) {
           const row= updatedWorksheet.addRow([
                user.matricule, user.firstName, user.lastName, user.email, user.phoneNumber, user.role, user.professionalStatus,
               , `Error: ${reason}`
            ]);
            row.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' }, // Red color
            };
        }

        for (const user of validUsers) {
            updatedWorksheet.addRow([
                user.matricule, user.firstName, user.lastName, user.email, user.phoneNumber, user.role, user.professionalStatus,
             user.generatedPassword,"Success"
            ]);
        }

        const updatedFilePath = "../excel_files/exports/UpdatedUsers.xlsx";
        await updatedWorkbook.xlsx.writeFile(updatedFilePath);
        await sendEmail([updatedFilePath, "../excel_files/exports/errors.log"]);

        console.log("✅ Import Users script completed successfully.");
    } catch (error) {
        console.error(`❌ Error during import: ${error.message}`);
    }

};

module.exports = importUsers;
importUsers();
