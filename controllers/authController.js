const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { setCache } = require("../index");
const prisma = new PrismaClient();
const sessions = {};

const registerUser = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // If a session already exists, log out the previous session
  if (sessions[user.id]) {
    const { io } = require("../index");
    io.to(sessions[user.id]).emit("forceLogout");
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  sessions[user.id] = req.socket.id;

  // Update sessionToken in the database
  await prisma.user.update({
    where: { id: user.id },
    data: { sessionToken: token },
  });

  setCache(`/api/auth/user/${user.id}`, user); // Cache user data

  res.cookie("token", token, { httpOnly: true });
  res.json({ message: "Login successful" });
};

module.exports = { registerUser, loginUser };
