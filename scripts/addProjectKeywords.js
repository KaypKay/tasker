const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Adding project keywords functionality...');

  // Add keywords columns to projects table
  db.run(`
    ALTER TABLE projects ADD COLUMN keyword1 TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding keyword1:', err.message);
    }
  });

  db.run(`
    ALTER TABLE projects ADD COLUMN keyword2 TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding keyword2:', err.message);
    }
  });

  db.run(`
    ALTER TABLE projects ADD COLUMN keyword3 TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding keyword3:', err.message);
    }
  });

  db.run(`
    ALTER TABLE projects ADD COLUMN keyword4 TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding keyword4:', err.message);
    }
  });

  db.run(`
    ALTER TABLE projects ADD COLUMN keyword5 TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding keyword5:', err.message);
    }
  });

  // Also update people table to add nicknames if they don't exist
  db.run(`
    ALTER TABLE people ADD COLUMN nickname1 TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding nickname1:', err.message);
    }
  });

  db.run(`
    ALTER TABLE people ADD COLUMN nickname2 TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding nickname2:', err.message);
    }
  });

  db.run(`
    ALTER TABLE people ADD COLUMN nickname3 TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding nickname3:', err.message);
    }
  });

  console.log('Database schema updated successfully!');
  console.log('Projects can now have up to 5 keywords for automatic task assignment.');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database migration completed!');
  }
});