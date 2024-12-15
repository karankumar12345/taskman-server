import Task from "../models/task.model.js";

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, startTime, endTime, priority, status } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime || !priority || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }
   
    // Ensure the endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      return res
        .status(400)
        .json({ message: 'End time must be greater than start time' });
    }

    // Create the task
    const task = await Task.create({
      title,
      startTime,
      endTime,
      priority,
      status,
      userId: req.user.id,
      
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all tasks for the logged-in user
// Controller to get tasks with sorting
export const getTasks = async (req, res) => {
  try {
    const { sortBy, order, priority, status, userId } = req.query;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    let sortCriteria = {};
    if (sortBy === 'startTime') {
      sortCriteria.startTime = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'endTime') {
      sortCriteria.endTime = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'priority') {
      sortCriteria.priority = order === 'desc' ? -1 : 1;
    }

    const query = { userId }; // Ensure only tasks for the specified userId are fetched
    if (priority) {
      query.priority = priority;
    }
    if (status) {
      query.status = status;
    }

    // Find tasks matching query and sort criteria
    const tasks = await Task.find(query).sort(sortCriteria);

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};



// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update the task
    const task = await Task.findOneAndUpdate(
      { _id: id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the task
    const task = await Task.findOneAndDelete({ _id: id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    // Get total tasks
    const totalTasks = await Task.countDocuments();

    // Get completed tasks
    const completedTasks = await Task.countDocuments({ status: 'finished' });

    // Get pending tasks
    
    const pendingTasks = await Task.countDocuments({ status: 'pending' });

    // Calculate average time per completed task
    const completedTasksData = await Task.find({ status: 'finished' });
    const totalCompletedTime = completedTasksData.reduce((acc, task) => {
      return acc + (task.endTime - task.startTime);
    }, 0);
    const averageTimePerTask = totalCompletedTime / completedTasks;

    // Get pending tasks data
    const pendingTasksData = await Task.find({ status: 'pending' });
    const totalPendingTime = pendingTasksData.reduce((acc, task) => {
      return acc + (new Date() - task.startTime);
    }, 0);
    const estimatedTimeRemaining = pendingTasksData.reduce((acc, task) => {
      return acc + (task.endTime - new Date());
    }, 0);

    // Get task priority statistics
    const taskPriorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          totalElapsedTime: { $sum: '$endTime' - '$startTime' },
          totalEstimatedTime: { $sum: '$endTime' - new Date() },
        },
      },
    ]);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      averageTimePerTask,
      totalPendingTime,
      estimatedTimeRemaining,
      taskPriorityStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};




export const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId).populate('userId', 'name email'); // Populate user details

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching task by ID' });
  }
}


export const getTaskStatistics = async (req, res) => {
  try {
    // Get the total count of tasks
    const totalTasks = await Task.countDocuments();

    // Get completed and pending tasks
    const completedTasks = await Task.countDocuments({ status: 'finished' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });

    // Calculate percentage of completed and pending tasks
    const completedPercentage = (completedTasks / totalTasks) * 100 || 0;
    const pendingPercentage = (pendingTasks / totalTasks) * 100 || 0;

    // Calculate total time lapsed for pending tasks
    const lapsedTimes = await Task.aggregate([
      { $match: { status: 'pending' } },
      {
        $project: {
          priority: 1,
          lapsedTime: {
            $divide: [{ $subtract: [new Date(), '$startTime'] }, 3600000], // Time lapsed in hours
          },
        },
      },
    ]);

    // Calculate the balance estimated time for pending tasks (based on priority)
    const balanceTimes = await Task.aggregate([
      { $match: { status: 'pending' } },
      {
        $project: {
          priority: 1,
          balanceTime: {
            $divide: [{ $subtract: ['$endTime', new Date()] }, 3600000], // Time remaining in hours
          },
        },
      },
    ]);

    // Calculate overall actual average time for completion
    const completedTasksDurations = await Task.aggregate([
      { $match: { status: 'finished' } },
      {
        $project: {
          duration: {
            $divide: [{ $subtract: ['$endTime', '$startTime'] }, 3600000], // Time taken in hours
          },
        },
      },
    ]);

    const totalDuration = completedTasksDurations.reduce((acc, task) => acc + task.duration, 0);
    const averageCompletionTime = totalDuration / completedTasksDurations.length || 0;

    // Prepare and send the statistics
    res.status(200).json({
      totalTasks,
      completedPercentage,
      pendingPercentage,
      lapsedTimes,
      balanceTimes,
      averageCompletionTime,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error calculating task statistics' });
  }
};