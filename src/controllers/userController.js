const userService = require("../services/userService");

const createUser = async (req, res) => {
  const user = await userService.createUser(req.body, req.user);

  return res.status(201).json({
    message: "User created successfully",
    user
  });
};

const getUsers = async (req, res) => {
  const users = await userService.getUsers(req.user);
  return res.status(200).json({ users });
};

module.exports = { createUser, getUsers };