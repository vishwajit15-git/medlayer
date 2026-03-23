const userService = require("../services/userService");

const createUser = async (req, res) => {
  const user = await userService.createUser(req.body, req.user);

  return res.status(201).json({
    message: "User created successfully",
    user
  });
};

module.exports = { createUser };