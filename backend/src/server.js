const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { requirementsRouter } = require("./routes/requirements");

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://saikumaryadav712_db_user:4tEALPAJFr5IzMH1@cluster0.olipiwz.mongodb.net/?appName=Cluster0"
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

if (!MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.error("Missing MONGODB_URI in backend environment.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  const app = express();
  app.use(
    cors({
      origin: CLIENT_ORIGIN,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/requirements", requirementsRouter);

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

