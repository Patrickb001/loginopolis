const express = require("express");
const app = express();
const { User } = require("./db");
const bcrypt = require("bcrypt");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
  try {
    res.send(
      "<h1>Welcome to Loginopolis!</h1><p>Log in via POST /login or register via POST /register</p>"
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST /register
// TODO - takes req.body of {username, password} and creates a new user with the hashed password
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw new Error("Register attempt failed please try again.");
    const SALT_COUNT = 5;
    const hashPassword = await bcrypt.hash(password, SALT_COUNT);
    await User.create({ username, password: hashPassword });

    res.send(`successfully created user ${username}`);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

// POST /login
// TODO - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) throw new Error("incorrect username or password");

    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) throw new Error("incorrect username or password");

    res.status(200).send(`successfully logged in user ${username}`);
  } catch (error) {
    res.status(401).send(error.message);
  }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
