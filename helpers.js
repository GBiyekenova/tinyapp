const getUserByEmail = (email, database) => {
  let usersKeys = Object.keys(database);
  let result = undefined;
  const filtered = usersKeys.filter((key) => {
    return database[key].email === email
    
  });
  if (filtered.length > 0) {
    result = database[filtered[0]].id;
  }
  return result;
};

const urlsForUser = (userID, database) => {
    const urls = {};
    let arrOfKeys = Object.keys(database);
    for (const key of arrOfKeys) {
      if (database[key].userID === userID) {
        urls[key] = database[key].longURL;
      }
    }
    return urls;
  };

  function generateRandomString(length) {
    let result = "";
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charsLength = chars.length;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
  }

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

  const urlDatabase = {
    b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
    },
    i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
    }
  };

module.exports = { getUserByEmail, urlsForUser, generateRandomString, users, urlDatabase };