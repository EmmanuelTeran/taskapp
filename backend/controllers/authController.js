const { pool } = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const { rows: existing } = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existing.length)
      return res.status(409).json({ error: "Username already taken" });

    const hash = bcrypt.hashSync(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hash]
    );

    const token = jwt.sign(
      { id: rows[0].id, username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const { rows } = await pool.query(
      "SELECT id, password FROM users WHERE username = $1",
      [username]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Invalid credentials" });

    const ok = bcrypt.compareSync(password, rows[0].password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: rows[0].id, username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
};
