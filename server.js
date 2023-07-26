const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const app = express();
const port = 5050;

app.use("/images",express.static('images'));
app.use("/css",express.static('css'));
app.use("/k_drama",express.static('k_drama'));
app.use("/tranding_on_netflix",express.static('tranding_on_netflix'));
app.use("/bloob_master",express.static('bloob_master'));


const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "project-2",
});

connection.connect(function (error) {
  if (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
  console.log("Connected to the database");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/signin", function (req, res) {
  res.sendFile(__dirname + "/sign-in.html");
});

app.post("/signin", encoder, function (req, res) {
  const email_address = req.body.email_address;
  const password = req.body.password;

  connection.query(
    "SELECT * FROM users WHERE email_address = ? AND password = ?",
    [email_address, password],
    function (error, results, fields) {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).send("Internal Server Error");
      }

      if (results.length > 0) {
        res.redirect("/home");
      } else {
        res.redirect("/");
      }
    }
  );
});

app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/home.html");
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/sign-up.html");
});

app.post("/signup", encoder, function (req, res) {
  const username = req.body.username;
  const email_address = req.body.email_address;
  const password = req.body.password;

  // Perform validation on the input data
  if (!username || !email_address || !password) {
    return res.status(400).send("All fields are required.");
  }

  // Check if the username already exists
  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    function (error, results, fields) {
      if (error) {
        console.error("Error executing username check query:", error);
        return res.status(500).send("Internal Server Error");
      }

      if (results.length > 0) {
        return res.status(409).send("Username already exists.");
      }

      // Insert new user into the database
      connection.query(
        "INSERT INTO users (username, email_address, password) VALUES (?, ?, ?)",
        [username, email_address, password],
        function (error, results, fields) {
          if (error) {
            console.error("Error executing signup query:", error);
            return res.status(500).send("Internal Server Error");
          }

          res.redirect("/home");
        }
      );
    }
  );
});

app.listen(port, function () {
  console.log(`Server is running on http://localhost:${port}`);
});
