import sqlite3 from 'sqlite3';

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run('CREATE TABLE queries (id INTEGER PRIMARY KEY, query TEXT, reply TEXT)');
  db.run('INSERT INTO queries (query, reply) VALUES ("hello", "Hi there! How can I help you?")');
  db.run('INSERT INTO queries (query, reply) VALUES ("how are you?", "I am just a bot, but I am functioning as expected.")');
});

export const handleChat = (req, res) => {
  const { message } = req.body;

  db.get('SELECT reply FROM queries WHERE query = ?', [message.toLowerCase()], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send({ reply: 'Something went wrong.' });
    } else if (row) {
      res.send({ reply: row.reply });
    } else {
      res.send({ reply: "I don't understand that. Try asking something else!" });
    }
  });
}; 