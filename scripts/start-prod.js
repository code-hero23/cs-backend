const { spawn } = require('child_process');
const path = require('path');

// Fix DATABASE_URL for Prisma + SQLite
const fixDatabaseUrl = () => {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('/') && !process.env.DATABASE_URL.startsWith('file:')) {
        console.log('Correction: Adding "file:" prefix to DATABASE_URL');
        // Ensure "file:" prefix is present for local paths (SQLite)
        process.env.DATABASE_URL = `file:${process.env.DATABASE_URL}`;
    } else {
        console.log('DATABASE_URL check passed or not set (using default)');
    }

    // Debug output (masking the actual path for security if needed, but here it's likely internal)
    console.log(`Using DATABASE_URL: ${process.env.DATABASE_URL}`);
};

const runCommand = (command, args) => {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            env: { ...process.env } // Pass the modified env
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`);
                reject(new Error(`Command failed with code ${code}`));
            } else {
                resolve();
            }
        });
    });
};

const start = async () => {
    try {
        console.log('==> Starting Production Server Script...');

        // 1. Fix Environment
        fixDatabaseUrl();

        // 2. Run Prisma Push (Ensure DB schema is sync)
        console.log('==> Running Prisma DB Push...');
        // We use 'npx' (or just 'prisma' if in path) to run prisma
        // Using 'npx prisma db push' is safer in some envs
        await runCommand('npx', ['prisma', 'db', 'push']);

        // 3. Seed Database (Safe)
        console.log('==> Running Safe Seed...');
        await runCommand('node', ['scripts/seed-safe.js']);

        // 4. Start the Node App
        console.log('==> Starting Node App...');
        await runCommand('node', ['src/app.js']);

    } catch (error) {
        console.error('==> Failed to start application:', error);
        process.exit(1);
    }
};

start();
