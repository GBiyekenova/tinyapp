const express = require("express");
const app = express();

const { getUserByEmail, urlsForUser, generateRandomString, users, urlDatabase } = require("./helpers");

const bcrypt = require('bcryptjs');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.status(400).send("You have logged out");
  }
  const user = users[userID];
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: urls, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.session["user_id"];
  console.log(username);
  if (!username) {
    res.redirect("/login").status(400).send("You are not logged in");
  }
  let user = users[username];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const username = req.session["user_id"];
  const short = req.params.shortURL;
  if (!username) {
    res.redirect("/login").status(400).send("You are not logged in");
  }
  console.log(username);
  console.log(urlDatabase[short].userID)
  if (urlDatabase[short].userID != username) {
    return res.status(401).send("You cannot access this URL");
  }
  let user = users[username];
  const templateVars = { user: user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.status(400).send("You are not authorized");
  }

  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send("You need to pass a longURL");
  }

  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const userID = req.session["user_id"];
  if (!short) {
    return res.status(400).send("id is not provided");
  }
  if (urlDatabase[short].userID != userID) {
    return res.status(401).send("You cannot access this URL");
  }
  if (short in urlDatabase) {
    const longURL = urlDatabase[short].longURL;
    return res.redirect(longURL);
  } else {
    return res.status(403).send("Such id does not exist");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  const short = req.params.shortURL;
  if (urlDatabase[short].userID == userID) {
    delete urlDatabase[short];
    return res.redirect("/urls");
  }
  res.status(403).send("you cannot delete this URL");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session["user_id"];
  const short = req.params.id;
  if (urlDatabase[short].userID === userID) {
    urlDatabase[short].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
  res.status(403).send("You cannot edit this URL");

});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let user = getUserByEmail(email, users);
  console.log(user);
  if (user) {
    if (bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = user;
      return res.redirect("/urls");
    }
    return res.status(403).send("password does not match");
  } else {
    return res.status(403).send("such user does not exist");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userID = req.session["user_id"];
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please enter email/password");
  }

  let user = getUserByEmail(req.body.email, users);
  console.log(user);

  if (user) {
    return res.status(400).send("Email exists");
  }

  const userRandomID = generateRandomString(6);

  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  req.session.user_id = userRandomID;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});