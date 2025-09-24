const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// API Routes

// People routes
app.get('/api/people', (req, res) => {
  db.all('SELECT * FROM people ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/people', (req, res) => {
  const { name, email, nickname1, nickname2, nickname3 } = req.body;
  // Convert empty email to null to avoid UNIQUE constraint issues
  const cleanEmail = email && email.trim() !== '' ? email : null;
  db.run('INSERT INTO people (name, email, nickname1, nickname2, nickname3) VALUES (?, ?, ?, ?, ?)',
    [name, cleanEmail, nickname1 || null, nickname2 || null, nickname3 || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID, name, email: cleanEmail, nickname1, nickname2, nickname3 });
    }
  });
});

app.put('/api/people/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, nickname1, nickname2, nickname3 } = req.body;
  // Convert empty email to null to avoid UNIQUE constraint issues
  const cleanEmail = email && email.trim() !== '' ? email : null;

  db.run(
    `UPDATE people SET
     name = ?, email = ?, nickname1 = ?, nickname2 = ?, nickname3 = ?
     WHERE id = ?`,
    [name, cleanEmail, nickname1 || null, nickname2 || null, nickname3 || null, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Person updated successfully' });
      }
    }
  );
});

app.delete('/api/people/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM people WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Person deleted successfully' });
    }
  });
});

// Projects routes
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/projects', (req, res) => {
  const { name, description, keyword1, keyword2, keyword3, keyword4, keyword5 } = req.body;
  db.run('INSERT INTO projects (name, description, keyword1, keyword2, keyword3, keyword4, keyword5) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, keyword1 || null, keyword2 || null, keyword3 || null, keyword4 || null, keyword5 || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID, name, description, status: 'active', keyword1, keyword2, keyword3, keyword4, keyword5 });
    }
  });
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, status, keyword1, keyword2, keyword3, keyword4, keyword5 } = req.body;

  db.run(
    `UPDATE projects SET
     name = ?, description = ?, status = ?, keyword1 = ?, keyword2 = ?, keyword3 = ?, keyword4 = ?, keyword5 = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, description, status, keyword1 || null, keyword2 || null, keyword3 || null, keyword4 || null, keyword5 || null, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Project updated successfully' });
      }
    }
  );
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Project deleted successfully' });
    }
  });
});

// Tasks routes
app.get('/api/tasks', (req, res) => {
  const query = `
    SELECT t.*
    FROM tasks t
    ORDER BY t.created_at DESC
  `;

  db.all(query, (err, tasks) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Get assignees and projects for each task
    const tasksWithDetails = [];
    let completed = 0;

    if (tasks.length === 0) {
      res.json([]);
      return;
    }

    tasks.forEach(task => {
      // Get assignees for this task
      db.all(`
        SELECT p.id, p.name, p.email, p.nickname1, p.nickname2, p.nickname3
        FROM task_assignees ta
        JOIN people p ON ta.person_id = p.id
        WHERE ta.task_id = ?
      `, [task.id], (err, assignees) => {
        if (err) {
          console.error('Error getting assignees:', err);
          assignees = [];
        }

        // Get projects for this task
        db.all(`
          SELECT pr.id, pr.name, pr.description, pr.status
          FROM task_projects tp
          JOIN projects pr ON tp.project_id = pr.id
          WHERE tp.task_id = ?
        `, [task.id], (err, projects) => {
          if (err) {
            console.error('Error getting projects:', err);
            projects = [];
          }

          task.assignees = assignees;
          task.projects = projects;

          // Legacy fields for backward compatibility
          task.person_name = assignees.length > 0 ? assignees.map(a => a.name).join(', ') : null;
          task.project_name = projects.length > 0 ? projects.map(p => p.name).join(', ') : null;

          tasksWithDetails.push(task);
          completed++;

          if (completed === tasks.length) {
            res.json(tasksWithDetails);
          }
        });
      });
    });
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, assigned_to, project_id, assignee_ids, project_ids, priority, due_date } = req.body;

  // Create the task first
  db.run(
    'INSERT INTO tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)',
    [title, description, priority, due_date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const taskId = this.lastID;
      let operationsCompleted = 0;
      let totalOperations = 0;

      // Handle multiple assignees
      const assignees = assignee_ids || (assigned_to ? [assigned_to] : []);
      if (assignees.length > 0) {
        totalOperations += assignees.length;
        assignees.forEach(personId => {
          db.run('INSERT INTO task_assignees (task_id, person_id) VALUES (?, ?)',
            [taskId, personId], (err) => {
              if (err) console.error('Error assigning person:', err);
              operationsCompleted++;
              checkComplete();
            });
        });
      }

      // Handle multiple projects
      const projects = project_ids || (project_id ? [project_id] : []);
      if (projects.length > 0) {
        totalOperations += projects.length;
        projects.forEach(projId => {
          db.run('INSERT INTO task_projects (task_id, project_id) VALUES (?, ?)',
            [taskId, projId], (err) => {
              if (err) console.error('Error assigning project:', err);
              operationsCompleted++;
              checkComplete();
            });
        });
      }

      function checkComplete() {
        if (totalOperations === 0 || operationsCompleted >= totalOperations) {
          res.json({
            id: taskId,
            title,
            description,
            priority,
            due_date,
            status: 'pending',
            assignee_ids: assignees,
            project_ids: projects
          });
        }
      }

      // If no assignments, return immediately
      if (totalOperations === 0) {
        checkComplete();
      }
    }
  );
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assigned_to, project_id, assignee_ids, project_ids, due_date } = req.body;

  // Update the main task
  db.run(
    `UPDATE tasks SET
     title = ?, description = ?, status = ?, priority = ?,
     due_date = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, description, status, priority, due_date, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Clear existing assignments
      db.run('DELETE FROM task_assignees WHERE task_id = ?', [id], (err) => {
        if (err) console.error('Error clearing assignees:', err);
      });

      db.run('DELETE FROM task_projects WHERE task_id = ?', [id], (err) => {
        if (err) console.error('Error clearing projects:', err);
      });

      // Add new assignments
      const assignees = assignee_ids || (assigned_to ? [assigned_to] : []);
      const projects = project_ids || (project_id ? [project_id] : []);

      assignees.forEach(personId => {
        db.run('INSERT INTO task_assignees (task_id, person_id) VALUES (?, ?)',
          [id, personId], (err) => {
            if (err) console.error('Error assigning person:', err);
          });
      });

      projects.forEach(projId => {
        db.run('INSERT INTO task_projects (task_id, project_id) VALUES (?, ?)',
          [id, projId], (err) => {
            if (err) console.error('Error assigning project:', err);
          });
      });

      res.json({ message: 'Task updated successfully' });
    }
  );
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  // Delete task (cascade will handle junction table cleanup)
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Manual cleanup in case cascade isn't working
      db.run('DELETE FROM task_assignees WHERE task_id = ?', [id]);
      db.run('DELETE FROM task_projects WHERE task_id = ?', [id]);
      res.json({ message: 'Task deleted successfully' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});