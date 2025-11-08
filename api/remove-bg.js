import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false
  }
};

const upload = multer();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  upload.single("image_file")(req, {}, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file" });

    try {
      const form = new FormData();
      form.append("image_file", req.file.buffer, { filename: req.file.originalname });

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": process.env.REMOVE_BG_KEY, ...form.getHeaders() },
        body: form
      });

      const arrayBuffer = await response.arrayBuffer();
      if (!response.ok) {
        const text = Buffer.from(arrayBuffer).toString("utf-8");
        return res.status(502).json({ error: text });
      }

      res.setHeader("Content-Type", "image/png");
      res.send(Buffer.from(arrayBuffer));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}