const API_URL = 'http://localhost:3000/tasks';

const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks');

// Charger les tâches au chargement de la page
document.addEventListener('DOMContentLoaded', loadTasks);

// Soumission du formulaire
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newTask = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value || undefined,
    dueDate: document.getElementById('dueDate').value || undefined,
    priority: document.getElementById('priority').value,
    status: document.getElementById('status').value,
    category: document.getElementById('category').value || undefined
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });

    if (!res.ok) {
      const err = await res.json();
      alert('Erreur lors de la création : ' + (err.message || res.status));
      return;
    }

    // Réinitialiser le formulaire
    taskForm.reset();
    document.getElementById('priority').value = 'moyenne';
    document.getElementById('status').value = 'à faire';

    // Recharger la liste
    await loadTasks();
  } catch (error) {
    console.error(error);
    alert('Erreur réseau');
  }
});

// Charger les tâches depuis l’API
async function loadTasks() {
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (error) {
    console.error(error);
    tasksContainer.innerHTML = '<div class="empty">Erreur de chargement des tâches.</div>';
  }
}

function renderTasks(tasks) {
  if (!tasks.length) {
    tasksContainer.innerHTML = '<div class="empty">Aucune tâche pour le moment.</div>';
    return;
  }

  tasksContainer.innerHTML = '';

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task';

    const main = document.createElement('div');
    main.className = 'task-main';

    const title = document.createElement('p');
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('p');
    meta.className = 'task-meta';

    const priorityBadge = document.createElement('span');
    priorityBadge.className = 'badge ' + getPriorityBadgeClass(task.priority);
    priorityBadge.textContent = task.priority || 'moyenne';

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + getStatusBadgeClass(task.status);
    statusBadge.textContent = task.status || 'à faire';

    const extra = [];

    if (task.category) extra.push(`Catégorie : ${task.category}`);
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      extra.push(`Échéance : ${d.toLocaleDateString('fr-FR')}`);
    }

    meta.appendChild(priorityBadge);
    meta.insertAdjacentText('beforeend', ' ');
    meta.appendChild(statusBadge);

    if (extra.length) {
      meta.insertAdjacentText('beforeend', ' • ' + extra.join(' | '));
    }

    main.appendChild(title);
    if (task.description) {
      const desc = document.createElement('p');
      desc.style.margin = '0.25rem 0';
      desc.style.fontSize = '0.85rem';
      desc.textContent = task.description;
      main.appendChild(desc);
    }
    main.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = 'Terminer';
    doneBtn.onclick = () => updateStatus(task._id, 'terminée');

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.onclick = () => deleteTask(task._id);

    actions.appendChild(doneBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(main);
    div.appendChild(actions);

    tasksContainer.appendChild(div);
  });
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'haute': return 'badge-priority-haute';
    case 'basse': return 'badge-priority-basse';
    default: return 'badge-priority-moyenne';
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'en cours': return 'badge-status-en-cours';
    case 'terminée': return 'badge-status-terminee';
    default: return 'badge-status-a-faire';
  }
}

async function updateStatus(id, newStatus) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      const err = await res.json();
      alert('Erreur mise à jour : ' + (err.message || res.status));
      return;
    }

    await loadTasks();
  } catch (error) {
    console.error(error);
    alert('Erreur réseau');
  }
}

async function deleteTask(id) {
  if (!confirm('Supprimer cette tâche ?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const err = await res.json();
      alert('Erreur suppression : ' + (err.message || res.status));
      return;
    }

    await loadTasks();
  } catch (error) {
    console.error(error);
    alert('Erreur réseau');
  }
}
    