/* eslint-disable import/newline-after-import */
/* eslint-disable import/order */
const express = require("express");
const connectDB = require("./config/db");
const app = express();
const morgan = require("morgan");

// Connect DB
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.send("API running");
});

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server stated on port ${PORT}`));
