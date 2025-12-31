const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Cleaning Database...");

    // 1. Delete all existing data
    // 1. Delete all existing data in correct FK order
    // Deleting User might fail if Projects reference it (as Client).
    // Deleting Project might fail if Tasks reference it.

    // 1. Delete all leaf nodes first (child tables)
    await prisma.projectImage.deleteMany({});
    await prisma.projectDocument.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.task.deleteMany({});

    // Clear Projects
    await prisma.project.deleteMany({});

    // Clear Users (which includes Employees, Clients, Admins)
    await prisma.user.deleteMany({});

    console.log("Empty! 🌱 Seeding Super Admin...");

    // 2. Create fresh Super Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@cookscape.com',
            name: 'Super Admin',
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    });

    console.log("✅ Database Reset Complete.");
    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
