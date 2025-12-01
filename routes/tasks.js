// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /tasks : récupérer toutes les tâches avec filtres + tri + recherche
router.get('/', async (req, res) => {
  try {
    const { status, priority, category, search, sort } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    if (sort) {
      // sort = "dueDate" ou "-dueDate"
      const field = sort.replace('-', '');
      const direction = sort.startsWith('-') ? -1 : 1;
      sortOption[field] = direction;
    } else {
      sortOption = { createdAt: -1 }; // par défaut : plus récentes
    }

    const tasks = await Task.find(filter).sort(sortOption);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /tasks/:id : récupérer une tâche par id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /tasks : créer une tâche
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    const saved = await task.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Données invalides', error: err.message });
  }
});

// PUT /tasks/:id : modifier une tâche
router.put('/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Données invalides', error: err.message });
  }
});

// DELETE /tasks/:id : supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /tasks/:id/subtasks : ajouter une sous-tâche
router.post('/:id/subtasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Le titre de la sous-tâche est requis' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    task.subTasks.push({ title });
    await task.save();

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /tasks/:id/subtasks/:subId : modifier une sous-tâche
router.put('/:id/subtasks/:subId', async (req, res) => {
  try {
    const { title, completed } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    const subTask = task.subTasks.id(req.params.subId);
    if (!subTask) {
      return res.status(404).json({ message: 'Sous-tâche non trouvée' });
    }

    if (title !== undefined) subTask.title = title;
    if (completed !== undefined) subTask.completed = completed;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /tasks/:id/subtasks/:subId : supprimer une sous-tâche
router.delete('/:id/subtasks/:subId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    const subTask = task.subTasks.id(req.params.subId);
    if (!subTask) {
      return res.status(404).json({ message: 'Sous-tâche non trouvée' });
    }

    subTask.remove();
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /tasks/:id/comments : ajouter un commentaire
router.post('/:id/comments', async (req, res) => {
  try {
    const { author, message } = req.body;
    if (!author || !message) {
      return res.status(400).json({ message: 'Auteur et message sont requis' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    task.comments.push({ author, message });
    await task.save();

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /tasks/:id/comments/:commentId : supprimer un commentaire
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    comment.remove();
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;