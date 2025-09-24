const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create people table
  db.run(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_to INTEGER,
      project_id INTEGER,
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES people(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);

  // Insert sample data
  db.run(`INSERT INTO people (name, email) VALUES ('John Doe', 'john@example.com')`);
  db.run(`INSERT INTO people (name, email) VALUES ('Jane Smith', 'jane@example.com')`);
  
  db.run(`INSERT INTO projects (name, description) VALUES ('Website Redesign', 'Complete overhaul of company website')`);
  db.run(`INSERT INTO projects (name, description) VALUES ('Mobile App', 'Development of mobile application')`);
  
  db.run(`INSERT INTO tasks (title, description, assigned_to, project_id) VALUES ('Design mockups', 'Create initial design mockups', 1, 1)`);
  db.run(`INSERT INTO tasks (title, description, assigned_to, project_id) VALUES ('Setup database', 'Configure database schema', 2, 2)`);
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database initialized successfully!');
  }
});