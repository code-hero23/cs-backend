const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const clientRoutes = require('./routes/clientRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project-data', require('./routes/projectDataRoutes'));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cookscape Backend is running' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Serve Static Frontend (Production)
const path = require('path');
// Serve static files from the React app (assuming build output is in ../../dist due to current folder structure: root/server/src/app.js)
const buildPath = path.join(__dirname, '../../dist');
app.use(express.static(buildPath));

// Catch-all handler for any request that doesn't match an API route
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
