import sqlite3 from 'sqlite3';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from 'dotenv';

dotenv.config();

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-pro",
  temperature: 0,
  maxRetries: 2,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant that can answer questions and provide information. You should provide concise and accurate responses."
  ],
  ["human", "{input}"],
]);

const chain = prompt.pipe(llm);

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run('CREATE TABLE queries (id INTEGER PRIMARY KEY, query TEXT, reply TEXT)');
  db.run('INSERT INTO queries (query, reply) VALUES ("hello", "Hi there! How can I help you?")');
  db.run('INSERT INTO queries (query, reply) VALUES ("how are you?", "I am just a bot, but I am functioning as expected.")');
});

export const handleChat = (req, res) => {
  const { message } = req.body;

  db.get('SELECT reply FROM queries WHERE query = ?', [message.toLowerCase()], async (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send({ reply: 'Something went wrong.' });
    } else if (row) {
      res.send({ reply: row.reply });
    } else {
      console.log(message);
      try {
        const response = await chain.invoke({
          input: message,
        });
        res.send({ reply: response.content });
      } catch (error) {
        console.error('AI Error:', error);
        res.status(500).send({ reply: 'Sorry, I had trouble processing your request.' });
      }
    }
  });
}; 