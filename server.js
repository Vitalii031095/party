
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");


const app = express();
app.use(cors({
  origin: 'https://party.marsof.pp.ua'
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/env-check", (req, res) => {
//   res.json({
//     PAYMENTO_API_KEY: process.env.PAYMENTO_API_KEY ? "✅ SET" : "❌ MISSING",
//     CALLBACK_URL: process.env.CALLBACK_URL,
//     SUCCESS_URL: process.env.SUCCESS_URL,
//     DECLINE_URL: process.env.DECLINE_URL,
//   });
// });
// 1️⃣ Створюємо замовлення
// app.post("/test-post", (req, res) => {
//   res.json({ message: "POST works" });
// });
// app.get("/create-payment", (req, res) => {
//   res.send("GET works");
// });

app.post("/create-payment", async (req, res) => {
  try {
	console.log("start")
    const response = await axios.post(
      "https://app.paymento.io/api/v1/payments",
		
      {
        amount: 333,
        currency: "USDT",
        description: "Crypto Party Ticket",
        callback_url: process.env.CALLBACK_URL,
        success_url: process.env.SUCCESS_URL,
        decline_url: process.env.DECLINE_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYMENTO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Отримали токен від Paymento
	 console.log("start1")
    const token = response.data.token;
    res.json({
      paymentUrl: `https://app.paymento.io/gateway?token=${token}`,
    });
  } catch (error) {
    console.error("Payment creation failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

// 2️⃣ Callback від Paymento
app.post("/callback", async (req, res) => {
  try {
    const { token, status } = req.body;

    console.log("Callback received:", req.body);

    // (Опціонально) перевіряємо статус платежу через API
    const verify = await axios.get(
      `https://app.paymento.io/api/v1/payments/${token}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYMENTO_API_KEY}`,
        },
      }
    );

    console.log("Verified payment:", verify.data);

    if (verify.data.status === "success") {
      // TODO: Надсилаємо email клієнту
      console.log("✅ Оплата підтверджена, можна відправити білет!");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Callback handling error:", error.message);
    res.sendStatus(500);
  }
});
 const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log((`Server running on http://localhost:${PORT}`));
});

