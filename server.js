// server.js
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // jika Node <18, install node-fetch@2

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY belum diset. Lakukan konfigurasi di .env");
}

// Endpoint proxy
app.post('/api/generate', async (req, res) => {
  try {
    // terima contents dari klien
    const payload = req.body || {};
    // sesuaikan endpoint & model sesuai kebutuhan
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

    // Jika ingin menambahkan safetySettings / generationConfig, bisa di-merge di sini
    const body = {
      ...payload,
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048
      }
    };

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(apiRes.status).json({ message: errText });
    }

    const apiJson = await apiRes.json();
    // Ambil teks kandidat pertama (sama seperti di kode klien original)
    const candidate = apiJson.candidates?.[0];
    const reply = candidate?.content?.parts?.[0]?.text || "";

    // Kembalikan respons bersih ke klien
    res.json({ ok: true, reply, raw: apiJson });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada http://localhost:${PORT}`);
});

