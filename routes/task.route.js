import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createTask ,  getTasks,
    updateTask,
    deleteTask,
    
    getTaskStatistics,
    getTaskById,
    getDashboardData,} from '../controllers/task.controller.js';



const taskrouter = express.Router();

// Task Routes (Protected by authentication middleware)
taskrouter.post('/', authenticate, createTask); // Create a task
taskrouter.get('/gettask', getTasks); // Get all tasks with filters/sorting
taskrouter.put('/update/:id', authenticate, updateTask); // Update a task
taskrouter.delete('/delete/:id', authenticate, deleteTask); // Delete a task
 // Get task statistics


taskrouter.get('/task-statistics', getTaskStatistics);
taskrouter.get('/task/:id', getTaskById);

taskrouter.get("/getDashboard",getDashboardData);
export default taskrouter;
