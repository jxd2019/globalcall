
const express = require("express");
const twilio = require("twilio");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "https://jxd2019.github.io"
  ]
}));

app.use(express.json());

const {
  ACCOUNT_SID,
  AUTH_TOKEN,
  TWILIO_NUMBER,
  APP_SID
} = process.env;

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Backend health check
app.get("/", (req, res) => {
  res.send("GlobalCall Backend is running!");
});

// Twilio browser-call webhook
app.post("/voice", (req, res) => {
  const to = req.body.To;

  const response = new twilio.twiml.VoiceResponse();

  if (!to) {
    response.say("No destination number provided.");
    return res.type("text/xml").send(response.toString());
  }

  const dial = response.dial({
    callerId: TWILIO_NUMBER
  });

  dial.number(to);

  res.type("text/xml").send(response.toString());
});

// Browser calling token
app.get("/token", (req, res) => {
  const identity = "globalcall_user";

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    ACCOUNT_SID,
    process.env.API_KEY,
    process.env.API_SECRET,
    { identity }
  );

  token.addGrant(
    new VoiceGrant({
      outgoingApplicationSid: APP_SID
    })
  );

  res.json({
    token: token.toJwt()
  });
});

// Twilio outgoing call application
app.post("/outgoing", (req, res) => {
  const response = new twilio.twiml.VoiceResponse();

  const to = req.body.To;

  if (!to) {
    response.say("Destination missing");
  } else {
    response.dial({
      callerId: TWILIO_NUMBER
    }).number(to);
  }

  res.type("text/xml").send(response.toString());
});

app.listen(process.env.PORT || 3000, () => {
  console.log("GlobalCall backend running");
});
