const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "progress.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}", "utf8");

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return {}; }
}
function writeDB(db) {
  const temp = DB_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(temp, DB_FILE);
}
function send(res, status, data, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff" });
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 100000) { reject(new Error("Payload terlalu besar")); req.destroy(); }
    });
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { reject(new Error("JSON tidak valid")); }
    });
  });
}
function cleanUsername(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}
function validUsername(name) {
  return /^[a-zA-Z0-9_]{3,18}$/.test(name);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    return send(res, 200, { ok: true, app: "Nihongo Quest" });
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    try {
      const body = await readBody(req);
      const username = cleanUsername(body.username);
      if (!validUsername(username)) {
        return send(res, 400, { error: "Username harus 3–18 karakter: huruf, angka, atau underscore." });
      }
      const db = readDB();
      if (!db[username]) {
        db[username] = {
          username, xp: 0, completed: [], difficult: [], answers: 0,
          correct: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        writeDB(db);
      }
      return send(res, 200, { profile: db[username] });
    } catch (e) { return send(res, 400, { error: e.message }); }
  }

  if (req.method === "GET" && url.pathname === "/api/progress") {
    const username = cleanUsername(url.searchParams.get("username"));
    const db = readDB();
    if (!db[username]) return send(res, 404, { error: "Profil belum ditemukan." });
    return send(res, 200, { profile: db[username] });
  }

  if (req.method === "POST" && url.pathname === "/api/progress") {
    try {
      const body = await readBody(req);
      const username = cleanUsername(body.username);
      const db = readDB();
      if (!validUsername(username) || !db[username]) return send(res, 404, { error: "Profil tidak ditemukan. Login ulang." });
      const xp = Math.max(0, Math.min(1000000, Number(body.xp) || 0));
      const completed = Array.isArray(body.completed) ? [...new Set(body.completed.map(String))].slice(0, 500) : [];
      const difficult = Array.isArray(body.difficult) ? [...new Set(body.difficult.map(String))].slice(0, 500) : [];
      const answers = Math.max(0, Number(body.answers) || 0);
      const correct = Math.max(0, Math.min(answers, Number(body.correct) || 0));
      db[username] = { ...db[username], xp, completed, difficult, answers, correct, updatedAt: new Date().toISOString() };
      writeDB(db);
      return send(res, 200, { profile: db[username], saved: true });
    } catch (e) { return send(res, 400, { error: e.message }); }
  }

  let filePath = url.pathname === "/" ? path.join(PUBLIC, "index.html") : path.join(PUBLIC, path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, ""));
  if (!filePath.startsWith(PUBLIC)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, "Not found", "text/plain; charset=utf-8");
    const ext = path.extname(filePath);
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
    send(res, 200, data, types[ext] || "application/octet-stream");
  });
});

server.listen(PORT, "0.0.0.0", () => console.log(`Nihongo Quest berjalan di port ${PORT}`));
