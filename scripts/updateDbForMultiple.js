const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Add nickname columns to people table if they don't exist
  db.run(`ALTER TABLE people ADD COLUMN nickname1 TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding nickname1:', err.message);
    }
  });

  db.run(`ALTER TABLE people ADD COLUMN nickname2 TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding nickname2:', err.message);
    }
  });

  db.run(`ALTER TABLE people ADD COLUMN nickname3 TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding nickname3:', err.message);
    }
  });

  // Create task_assignees junction table for many-to-many relationship
  db.run(`
    CREATE TABLE IF NOT EXISTS task_assignees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      person_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
      UNIQUE(task_id, person_id)
    )
  `);

  // Create task_projects junction table for many-to-many relationship
  db.run(`
    CREATE TABLE IF NOT EXISTS task_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE(task_id, project_id)
    )
  `);

  // Migrate existing data from tasks table to junction tables
  db.all(`SELECT id, assigned_to, project_id FROM tasks WHERE assigned_to IS NOT NULL OR project_id IS NOT NULL`, (err, rows) => {
    if (err) {
      console.error('Error reading existing tasks:', err.message);
      return;
    }

    rows.forEach(row => {
      // Migrate assignee
      if (row.assigned_to) {
        db.run(`INSERT OR IGNORE INTO task_assignees (task_id, person_id) VALUES (?, ?)`,
          [row.id, row.assigned_to], (err) => {
            if (err) console.error('Error migrating assignee:', err.message);
          });
      }

      // Migrate project
      if (row.project_id) {
        db.run(`INSERT OR IGNORE INTO task_projects (task_id, project_id) VALUES (?, ?)`,
          [row.id, row.project_id], (err) => {
            if (err) console.error('Error migrating project:', err.message);
          });
      }
    });

    console.log(`Migrated ${rows.length} existing tasks to new schema`);
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database schema updated successfully for multiple assignments!');
  }
});