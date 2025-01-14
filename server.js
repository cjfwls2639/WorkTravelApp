const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "wjdcjf4154@",
  database: "todo_app",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text VARCHAR(255) NOT NULL,
      working BOOLEAN NOT NULL,
      completed BOOLEAN NOT NULL
    );
  `;
  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating table:", err);
      return;
    }
    console.log("Table 'todos' is ready");
  });
});

// Create (C)
app.post("/todos", (req, res) => {
  console.log("Received POST request for /todos", req.body);
  const { text, working, completed } = req.body;
  const query = "INSERT INTO todos (text, working, completed) VALUES (?, ?, ?)";
  db.query(query, [text, working, completed], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(201).send({ id: result.insertId, text, working, completed });
  });
});

// Read (R)
app.get("/todos", (req, res) => {
  console.log("Received GET request for /todos");
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send(results);
  });
});

// Update (U)
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { text, working, completed } = req.body;
  const query =
    "UPDATE todos SET text = ?, working = ?, completed = ? WHERE id = ?";
  db.query(query, [text, working, completed, id], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send(result);
  });
});

// Delete (D)
app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM todos WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send(result);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
