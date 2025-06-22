const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

require('dotenv').config();
console.log('Slack URL from .env:', process.env.SLACK_WEBHOOK_URL);

const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());



// Route to handle incoming webhooks
app.post('/webhook', async (req, res) => {
  try { 
    // Read and increment counter
     const counter = await prisma.counter.upsert({
     where: { id: 1 },
     update: { count: { increment: 1 } },
     create: { id: 1, count: 1 }
    });
const count = counter.count;

    // Create the message
    const message = `${count}${getOrdinalSuffix(count)} user has entered the journey`;

    // Send message to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL.trim(), {
    text: message,
    });


    console.log('✅ Sent to Slack:', message);
    res.status(200).send({ success: true, message });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).send({ success: false });
  }
});

// Helper to get ordinal suffix (1st, 2nd, 3rd...)
function getOrdinalSuffix(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
 