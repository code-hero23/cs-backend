const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get tasks (with optional filtering)
exports.getTasks = async (req, res) => {
    try {
        const { projectId, employeeId, type } = req.query;

        const filter = {};
        if (projectId) filter.projectId = projectId;
        if (employeeId) filter.employeeId = employeeId;
        if (type) filter.type = type;

        const tasks = await prisma.task.findMany({
            where: filter,
            include: {
                project: { select: { name: true } },
                employee: { select: { name: true } }
            }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new task
exports.createTask = async (req, res) => {
    try {
        const task = await prisma.task.create({
            data: req.body
        });

        // Notify employee (Placeholder for Email/Socket)
        console.log(`[Notification] Auto-email task assignment to Employee ${req.body.employeeId}. Stage: ${req.body.stage || 'None'}`);

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const task = await prisma.task.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        await prisma.task.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
