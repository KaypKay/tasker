const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Adding sample projects with keywords...');

  // Website project with keywords
  db.run(`INSERT OR REPLACE INTO projects (id, name, description, keyword1, keyword2, keyword3, keyword4, keyword5)
          VALUES (1, 'Website Redesign', 'Complete overhaul of company website', 'website', 'web', 'design', 'frontend', 'ui')`);

  // Mobile app project with keywords
  db.run(`INSERT OR REPLACE INTO projects (id, name, description, keyword1, keyword2, keyword3, keyword4, keyword5)
          VALUES (2, 'Mobile App', 'Development of mobile application', 'mobile', 'app', 'ios', 'android', 'react-native')`);

  // Database project with keywords
  db.run(`INSERT INTO projects (name, description, keyword1, keyword2, keyword3, keyword4, keyword5)
          VALUES ('Database Migration', 'Migrate legacy database to new system', 'database', 'db', 'migration', 'sql', 'postgres')`);

  // Marketing project with keywords
  db.run(`INSERT INTO projects (name, description, keyword1, keyword2, keyword3, keyword4, keyword5)
          VALUES ('Marketing Campaign', 'Q4 marketing campaign launch', 'marketing', 'campaign', 'ads', 'social', 'promo')`);

  // Infrastructure project with keywords
  db.run(`INSERT INTO projects (name, description, keyword1, keyword2, keyword3, keyword4, keyword5)
          VALUES ('Infrastructure Upgrade', 'Server and deployment infrastructure', 'server', 'deployment', 'docker', 'aws', 'infrastructure')`);

  console.log('Sample projects with keywords added successfully!');
  console.log('');
  console.log('Test these by creating tasks with keywords:');
  console.log('- "Design new website homepage" → Should auto-assign to Website Redesign');
  console.log('- "Setup mobile app database" → Should auto-assign to Mobile App');
  console.log('- "Create marketing ads for campaign" → Should auto-assign to Marketing Campaign');
  console.log('- "Deploy server to AWS" → Should auto-assign to Infrastructure Upgrade');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Sample data creation completed!');
  }
});