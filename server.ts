import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import * as admin from "firebase-admin";

let stripeClient: Stripe | null = null;
function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

let firebaseAdminInitialized = false;
function initFirebaseAdmin() {
  if (!firebaseAdminInitialized) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountStr) {
      console.warn("FIREBASE_SERVICE_ACCOUNT is missing. Webhook won't be able to update Firestore.");
      return;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountStr);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseAdminInitialized = true;
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT", e);
    }
  }
}
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Stripe webhook needs raw body

  // Stripe webhook needs raw body
  app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch (e) {
      console.error("Stripe not configured");
      res.status(500).send("Stripe not configured");
      return;
    }

    let event;
    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
      } else {
        // Fallback if no webhook secret is set (less secure, but easier for testing)
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      if (userId) {
        initFirebaseAdmin();
        if (firebaseAdminInitialized) {
          try {
            await admin.firestore().collection('users').doc(userId).update({
              hasActiveLicense: true
            });
            console.log(`Successfully granted license to user: ${userId}`);
          } catch (error) {
            console.error("Error updating user license in Firestore:", error);
          }
        } else {
          console.log(`Payment successful for user ${userId}, but Firebase Admin is not configured to update the database.`);
        }
      }
    }

    res.json({received: true});
  });

  // Standard middleware for other routes
  app.use(express.json());

  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { userId, userEmail } = req.body;
      const stripe = getStripe();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        client_reference_id: userId,
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Plumbline Ritual Assistant License',
                description: 'Lifetime access to the Plumbline Ritual Assistant.',
              },
              unit_amount: 4999, // $49.99
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin || 'http://localhost:3000'}?success=true`,
        cancel_url: `${req.headers.origin || 'http://localhost:3000'}?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message });
    }
  });

 if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // ☁️ LIVE ON THE INTERNET: Give the exact GPS coordinates to the 'dist' folder
    const distPath = path.join(process.cwd(), "dist");
    
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
