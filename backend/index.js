const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const walletsRoutes = require("./src/routes/wallets.routes");
const categoriesRoutes = require("./src/routes/categories.routes");
const transactionsRoutes = require("./src/routes/transactions.routes");
const goalsRoutes = require("./src/routes/goals");
const insightsRoutes = require("./src/routes/insights.routes");
const transfersRoutes = require("./src/routes/transfers.routes");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/wallets", walletsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/transfers", transfersRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "maltrack-backend" });
});

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI manquant dans .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connecte");

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`API: http://localhost:${port}`));
  } catch (err) {
    console.error("Erreur:", err.message);
    process.exit(1);
  }
}

start();
