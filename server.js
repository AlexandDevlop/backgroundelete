const express = require("express");
const fetch = require("node-fetch"); // v2
const multer = require("multer");
const FormData = require("form-data");
require("dotenv").config({ path: "archivo.env" }); // <--- tu archivo.env

const app = express();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
const REMOVE_BG_URL = "https://api.remove.bg/v1.0/removebg";
const API_KEY = process.env.REMOVE_BG_KEY;
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.post("/api/remove-bg", upload.single("image_file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ error: "No se recibió archivo." });
    if (!API_KEY) return res.status(500).json({ error: "API Key no configurada." });

    const form = new FormData();
    form.append("image_file", req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });

    const response = await fetch(REMOVE_BG_URL, {
      method: "POST",
      headers: { "X-Api-Key": API_KEY, ...form.getHeaders() },
      body: form
    });

    const arrayBuffer = await response.arrayBuffer();

    if (!response.ok) {
      const text = Buffer.from(arrayBuffer).toString("utf-8");
      console.error("Error remove.bg:", response.status, text);
      return res.status(502).json({ error: "Error remove.bg", details: text });
    }

    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(arrayBuffer));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor", details: err.message });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

console.log("Tu API Key es:", process.env.REMOVE_BG_KEY);

const path = require("path");

// Esto asegura que cualquier ruta cargue index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});