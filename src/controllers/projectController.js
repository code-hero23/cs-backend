const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: { tasks: true } // Include tasks for stats
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const bcrypt = require('bcryptjs');

// Create new project
exports.createProject = async (req, res) => {
    try {
        const data = req.body;
        if (data.clientPassword) {
            data.clientPassword = await bcrypt.hash(data.clientPassword, 10);
        }
        const project = await prisma.project.create({
            data: data
        });

        // Seed Predefined Tasks
        await seedProjectTasks(project.id);

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get single project
exports.getProjectById = async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { tasks: true }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const data = req.body;
        if (data.clientPassword) {
            data.clientPassword = await bcrypt.hash(data.clientPassword, 10);
        }
        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: data
        });
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        await prisma.project.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper to seed tasks
async function seedProjectTasks(projectId) {
    const STAGES = {
        "Freezing Mail": [
            "Client Details", "Floor Plan", "Initial Estimate Options",
            "Finalized Variants & Initial Quote", "Initial Schematic Proposal",
            "Blurred DWG", "Payment Gateway", "Booking Docs"
        ],
        "Approval of finalized designs": [
            "PDI Reports", "FM taken by AE", "2D Drawing",
            "3D Rendered Images", "Production Payment", "Approval of Finalized Designs"
        ],
        "Production": [
            "Quality Check Process"
        ],
        "Installation": [
            "Installation Work", "Completion Certificate"
        ]
    };

    const tasksToCreate = [];

    Object.entries(STAGES).forEach(([stage, taskTitles]) => {
        taskTitles.forEach(title => {
            tasksToCreate.push({
                projectId,
                title,
                stage,
                status: "PENDING",
                priority: "MEDIUM",
                type: "TASK"
            });
        });
    });

    if (tasksToCreate.length > 0) {
        await prisma.task.createMany({ data: tasksToCreate });
    }
};
