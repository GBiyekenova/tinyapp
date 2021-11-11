const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');

app.use(cookieParser());

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString(length) {
  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charsLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.status(400).send("You have to log in");
  }
  const user = users[userID];
  //console.log(user);
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies['user_id'];
  //console.log(username);
  res.render("urls_new", { username });
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies['user_id'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  //console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.status(400).send("You are not authorized");
  }

  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send("You need to pass a longURL");
  }

  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const longURL = urlDatabase[short];
  //console.log(longURL)
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const short = req.params.id;
  urlDatabase[short] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let user = emailLookup(email);
  console.log(user)
  if (user.length > 0) {
    console.log(req.body.password)
    if (user[0].password !== req.body.password) {
      return res.status(403).send("password does not match");
    }
    return res.cookie("user_id", user[0].id).redirect("/urls");
  } else {
    return res.status(403).send("such user does not exist");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("urls_registration", templateVars);
});

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const emailLookup = (email) => {
  let usersKeys = Object.keys(users);
  let arr = [];
  const filtered = usersKeys.filter((key) => {
    return users[key].email === email
    
  });
  if (filtered.length > 0) {
    arr.push(users[filtered[0]])
  }
  return arr;
}

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please enter email/password");
  }

  let doesEmailExist = emailLookup(req.body.email);
  if (doesEmailExist.length > 0) {
    return res.status(400).send("Email exists");
  }

  const userRandomID = generateRandomString(6);
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", userRandomID);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars );
});
