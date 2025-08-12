require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ready } = require("./database"); // 👈 importa la promesa ready

const app = express();
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: corsOrigin }));

app.get("/api/health", (_, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected error" });
});

const PORT = process.env.PORT || 3001;
ready
  .then(() => {
    app.listen(PORT, () =>
      console.log(`API running on http://localhost:${PORT}`)
    );
  })
  .catch((e) => {
    console.error("DB init failed:", e);
    process.exit(1);
  });
