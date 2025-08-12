const { pool } = require("../database");

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, completed FROM tasks WHERE user_id = $1 ORDER BY id DESC",
      [req.user.id]
    );
    res.json(rows.map((r) => ({ ...r, completed: !!r.completed })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { title } = req.body ?? {};
    if (!title) return res.status(400).json({ error: "title required" });

    const { rows } = await pool.query(
      "INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING id, title, completed",
      [title, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const { title, completed } = req.body ?? {};
    const set = [];
    const vals = [];
    let i = 1;

    if (title !== undefined) {
      set.push(`title = $${i++}`);
      vals.push(title);
    }
    if (completed !== undefined) {
      set.push(`completed = $${i++}`);
      vals.push(!!completed);
    }
    if (!set.length) return res.json({ ok: true }); // nada que actualizar

    vals.push(id, req.user.id);
    const sql = `UPDATE tasks SET ${set.join(
      ", "
    )} WHERE id = $${i++} AND user_id = $${i} RETURNING id`;
    const { rowCount } = await pool.query(sql, vals);

    if (!rowCount) return res.status(404).json({ error: "Task not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const { rowCount } = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Task not found" });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
};
