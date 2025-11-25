const mongoose = require('mongoose');

// Sous-tâche
const SubTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

// Commentaire
const CommentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// Tâche principale
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  dueDate: { type: Date },
  
  priority: {
    type: String,
    enum: ['basse', 'moyenne', 'haute'],
    default: 'moyenne'
  },

  status: {
    type: String,
    enum: ['à faire', 'en cours', 'terminée'],
    default: 'à faire'
  },

  category: { type: String },

  subTasks: [SubTaskSchema],

  comments: [CommentSchema],

}, { timestamps: true }); 
// timestamps = createdAt / updatedAt automatiques

module.exports = mongoose.model('Task', TaskSchema);
