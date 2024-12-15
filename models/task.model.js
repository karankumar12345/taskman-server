import mongoose from 'mongoose';

// Define the Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      
    },
    priority: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5], // Priority levels 1 to 5
    },
    
    status: {
      type: String,
      required: true,
      enum: ['pending', 'finished'], // Only 'pending' or 'finished' allowed
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User Model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save Hook to Adjust End Time for Finished Tasks
taskSchema.pre('save', function (next) {
  if (this.status === 'finished' && !this.isModified('endTime')) {
    this.endTime = new Date(); // Update end time to actual completion time
  }
  next();
});

// Method to Calculate Task Durations
taskSchema.methods.calculateDuration = function () {
  if (this.status === 'finished') {
    return (this.endTime - this.startTime) / 3600000; // Time taken in hours
  } else {
    const currentTime = new Date();
    return Math.max((currentTime - this.startTime) / 3600000, 0); // Lapsed time in hours
  }
};

// Export Task Model
const Task = mongoose.model('Task', taskSchema);

export default Task;
