const express = require("express");
const path = require("path");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/call", async (req, res) => {
  try {
    const { number, pin } = req.body;

    if (pin !== process.env.CALL_PIN) {
      return res.status(401).json({ error: "Invalid PIN" });
    }

    if (!number || !/^\+[1-9]\d{7,14}$/.test(number)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const client = twilio(
      process.env.ACCOUNT_SID,
      process.env.AUTH_TOKEN
    );

    const call = await client.calls.create({
      to: number,
      from: process.env.TWILIO_NUMBER,
      url: `https://${req.get("host")}/twiml`
    });

    res.json({ success: true, callSid: call.sid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/twiml", (req, res) => {
  res.type("text/xml");
  res.send(`
    <Response>
      <Say voice="alice">Your GlobalCall connection is working.</Say>
    </Response>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("GlobalCall running on port " + PORT);
});
