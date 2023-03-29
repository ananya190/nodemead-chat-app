const users = [];

const addUser = ({ id, username, room }) => {
  // validate the data
  if (!username || !room) {
    return {
      error: "username and room are required",
    };
  }

  // clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // check for existing user with same username
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  // validate username
  if (existingUser) {
    return {
      error: "username is in use",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return {
    user,
  };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0]; // returns array, so take 1st element
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter(
    (user) => user.room === room.trim().toLowerCase()
  );
  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
