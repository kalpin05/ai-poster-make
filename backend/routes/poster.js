const express = require("express");
const router = express.Router();

const Poster = require("../models/Poster");
const ScanLog = require("../models/ScanLog");

const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");

// ------------------------------------------------------
// CREATE POSTER
// ------------------------------------------------------
router.post("/create", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    console.log("REQ BODY:", req.body);

    const poster = await Poster.create({
      title,
      description,
      imageUrl: null,
      qrCodeUrl: null,
      scanCount: 0
    });

    const qrData = `http://localhost:5000/poster/view/${poster.id}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const canvas = createCanvas(800, 1200);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.font = "bold 36px Arial";
    ctx.fillText(title, 50, 100);

    ctx.font = "24px Arial";
    ctx.fillText(description || "", 50, 160);

    const qrImage = await loadImage(qrCodeUrl);
    ctx.drawImage(qrImage, 550, 950, 200, 200);

    const imageUrl = canvas.toDataURL("image/png");

    poster.qrCodeUrl = qrCodeUrl;
    poster.imageUrl = imageUrl;
    await poster.save();

    res.json({
      message: "Poster created successfully",
      poster
    });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------
// VIEW POSTER
// ------------------------------------------------------
router.get("/view/:id", async (req, res) => {
  try {
    const poster = await Poster.findByPk(req.params.id);
    if (!poster) return res.status(404).json({ error: "Poster not found" });

    poster.scanCount += 1;
    await poster.save();

    await ScanLog.create({
      posterId: poster.id,
      userAgent: req.headers["user-agent"]
    });

    res.json({ message: "Poster viewed", poster });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------
// GET ALL POSTERS
// ------------------------------------------------------
router.get("/all", async (req, res) => {
  try {
    const posters = await Poster.findAll();
    res.json({ posters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------
// ANALYTICS
// ------------------------------------------------------
router.get("/analytics/:id", async (req, res) => {
  try {
    const logs = await ScanLog.findAll({
      where: { posterId: req.params.id },
      order: [["scannedAt", "DESC"]]
    });

    res.json({ logs });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------
// DAILY ANALYTICS
// ------------------------------------------------------
router.get("/analytics/:id/daily", async (req, res) => {
  try {
    const logs = await ScanLog.findAll({
      where: { posterId: req.params.id }
    });

    const daily = {};

    logs.forEach(log => {
      const day = log.scannedAt.toISOString().split("T")[0];
      daily[day] = (daily[day] || 0) + 1;
    });

    res.json({ daily });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------
// RECOMMENDATIONS
// ------------------------------------------------------
router.get("/recommendations", async (req, res) => {
  try {
    const posters = await Poster.findAll();

    if (posters.length === 0) {
      return res.json({ message: "Not enough data" });
    }

    const avgDescriptionLength =
      posters.reduce((sum, p) => sum + (p.description?.length || 0), 0) /
      posters.length;

    const avgScans =
      posters.reduce((sum, p) => sum + p.scanCount, 0) / posters.length;

    const topPoster = posters.sort((a, b) => b.scanCount - a.scanCount)[0];

    res.json({
      recommendations: {
        idealDescriptionLength: Math.round(avgDescriptionLength),
        averageScans: Math.round(avgScans),
        bestPerformingPoster: {
          id: topPoster.id,
          title: topPoster.title,
          scans: topPoster.scanCount
        },
        suggestions: [
          "Use high contrast colors",
          "Keep text short",
          "Place QR bottom-right",
          "Use bold fonts"
        ]
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------
module.exports = router;