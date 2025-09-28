

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: 'https://blog.marsof.pp.ua' // заміни на свій домен фронтенд якщо він начий 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("✅ Server is starting...");


app.post("/create-invoice", async (req, res) => {
  try {
    const postData = {
      public_key: process.env.PAYID19_PUBLIC_KEY,
      private_key: process.env.PAYID19_PRIVATE_KEY,
      email: req.body.email,
      price_amount: 1,
      price_currency:  "USD",
      merchant_id: 5,
      order_id: `order-${Date.now()}`,
      customer_id: Number(Date.now().toString().slice(0, 11)),
		test: 0,  // тільки для тестув
      title: "Crypto Night Ticket",
      description: "Ticket for private crypto event",
      add_fee_to_price: 1,
      cancel_url: process.env.CANCEL_URL,
      success_url: process.env.SUCCESS_URL,
      callback_url: process.env.CALLBACK_URL,
      expiration_date: 12,
      margin_ratio: 1.5,
    };

    const response = await axios.post('https://payid19.com/api/v1/create_invoice', postData);
    const result = response.data;

    if (result.status === 'error') {
      return res.status(400).json({ error: result.message[0] });
    }
res.json({ payid19: result.message }); // <-- саме цей URL очікує фронт

   //  res.json({ message: result.message, invoice: result.data });
  } catch (error) {
  if (error.response && error.response.data) {
    console.error("API error response:", error.response.data);
    res.status(500).json({ error: error.response.data.message || "Failed to create invoice" });
  } else {
    console.error(error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
}

});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



// Створення платежу — новий API Paymento
// app.post("/create-payment", async (req, res) => {
//   try {
//     const response = await axios.post(
//       "https://api.paymento.io/v1/payment/request",
//       {
//         fiatAmount: "1",                // сума у фіаті
//         fiatCurrency: "USD",              // валюта
//         ReturnUrl: process.env.SUCCESS_URL || "https://your-site.com/thank-you.html",
//         orderId: `order-${Date.now()}`,  // унікальний ID замовлення
//       },
//       {
//         headers: {
//           "Api-key": process.env.PAYMENTO_API_KEY,
//           "Content-Type": "application/json",
//           "Accept": "text/plain",
//         },
//       }
//     );

//     const token = response.data.body.trim();

//     res.json({
//       paymentUrl: `https://app.paymento.io/gateway?token=${token}`
//     });
//   } catch (error) {
//     console.error("Payment creation failed:", error.response?.data || error.message);
//     res.status(500).json({ error: "Payment creation failed" });
//   }
// });

// // Callback endpoint (якщо потрібно)
// app.post("/callback", (req, res) => {
//   console.log("Callback received:", req.body);
//   // Твої логіки перевірки статусу платежу та відправки квитка
//   res.sendStatus(200);
// });