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

module.exports = { getUserByEmail };