const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Add more people with nicknames
  db.run(`INSERT OR IGNORE INTO people (name, email, nickname1, nickname2, nickname3) VALUES ('John Smith', 'john.smith@example.com', 'John', 'Johnny', 'JS')`);
  db.run(`INSERT OR IGNORE INTO people (name, email, nickname1, nickname2, nickname3) VALUES ('Sarah Johnson', 'sarah.johnson@example.com', 'Sarah', 'Sara', 'SJ')`);
  db.run(`INSERT OR IGNORE INTO people (name, email, nickname1, nickname2, nickname3) VALUES ('Mike Davis', 'mike.davis@example.com', 'Mike', 'Michael', 'MD')`);
  db.run(`INSERT OR IGNORE INTO people (name, email, nickname1, nickname2, nickname3) VALUES ('Emily Brown', 'emily.brown@example.com', 'Emily', 'Em', 'EB')`);

  // Add more projects
  db.run(`INSERT OR IGNORE INTO projects (name, description) VALUES ('Marketing Campaign', 'Q4 marketing initiatives and promotions')`);
  db.run(`INSERT OR IGNORE INTO projects (name, description) VALUES ('Web Development', 'Frontend and backend development tasks')`);
  db.run(`INSERT OR IGNORE INTO projects (name, description) VALUES ('Data Analysis', 'Analytics and reporting projects')`);
  db.run(`INSERT OR IGNORE INTO projects (name, description) VALUES ('Mobile Application', 'iOS and Android app development')`);

  console.log('Test data added successfully!');
});

db.close();