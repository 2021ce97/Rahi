import express from "express";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Driver } from "./server/models/Driver";
import { Rider } from "./server/models/Rider";
import { Ride } from "./server/models/Ride";
import { Transaction } from "./server/models/Transaction";
import { Zone } from "./server/models/Zone";
import { DiasporaGift } from "./server/models/DiasporaGift";
import { Verification } from "./server/models/Verification";
import { Ticket } from "./server/models/Ticket";
import { sendSMS, SmsNotification } from "./server/services/smsService";
import * as db from "./src/data/mockData";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);
  const io = new SocketIOServer(server, { 
    cors: { origin: "*" }
  });

  // Middleware for API routes
  app.use(express.json());

  let mongoDbConnected = false;
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      mongoDbConnected = true;
      console.log("Connected to MongoDB");

      // Seeding Database if empty
      const driverCount = await Driver.countDocuments();
      if (driverCount === 0) {
        console.log("Seeding Database...");
        await Driver.insertMany(db.mockDrivers);
        await Rider.insertMany(db.mockRiders);
        await Ride.insertMany(db.mockRides);
        await Transaction.insertMany(db.mockTransactions);
        await Zone.insertMany(db.mockZones);
        await DiasporaGift.insertMany(db.mockDiasporaGifts);
        await Verification.insertMany(db.mockVerifications);
        await Ticket.insertMany(db.mockTickets);
      }
    } catch (err) {
      console.log("MongoDB connection skipped/failed. Ensure MONGODB_URI is valid.");
    }
  }

  // Basic admin login route
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    // Simple hardcoded auth for demonstration
    if (username === "admin" && password === "admin") {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Auth Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      next();
    });
  };

  // API Route - System Status
  
  let mockSosAlerts = [];
  app.get("/api/sos", (req, res) => {
    res.json(mockSosAlerts);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "HamRah Admin Backend", mongoDbConnected });
  });

  // Data Fetching APIs (Phase 6: Actual MongoDB Data)
  app.get("/api/drivers", async (req, res) => {
    if (mongoDbConnected) {
      const drivers = await Driver.find().sort({ createdAt: -1 });
      return res.json(drivers);
    }
    res.json([]);
  });

  app.get("/api/riders", async (req, res) => {
    if (mongoDbConnected) {
      const riders = await Rider.find().sort({ createdAt: -1 });
      return res.json(riders);
    }
    res.json([]);
  });

  app.get("/api/rides", async (req, res) => {
    if (mongoDbConnected) {
      const rides = await Ride.find().sort({ createdAt: -1 });
      return res.json(rides);
    }
    res.json([]);
  });
  
  app.get("/api/transactions", async (req, res) => {
    if (mongoDbConnected) {
      const tx = await Transaction.find().sort({ createdAt: -1 });
      return res.json(tx);
    }
    res.json([]);
  });

  app.get("/api/zones", async (req, res) => {
    if (mongoDbConnected) {
      const zones = await Zone.find().sort({ createdAt: -1 });
      return res.json(zones);
    }
    res.json([]);
  });

  app.get("/api/diaspora", async (req, res) => {
    if (mongoDbConnected) {
      const gifts = await DiasporaGift.find().sort({ createdAt: -1 });
      return res.json(gifts);
    }
    res.json([]);
  });

  app.get("/api/verifications", async (req, res) => {
    if (mongoDbConnected) {
      const v = await Verification.find().sort({ createdAt: -1 });
      return res.json(v);
    }
    res.json([]);
  });
  
  app.get("/api/tickets", async (req, res) => {
    if (mongoDbConnected) {
      const t = await Ticket.find().sort({ createdAt: -1 });
      return res.json(t);
    }
    res.json([]);
  });

  app.post("/api/tickets/:id/resolve", async (req, res) => {
    if (mongoDbConnected) {
      try {
        const t = await Ticket.findByIdAndUpdate(req.params.id, {
          status: "resolved",
          resolutionNotes: req.body.resolutionNotes
        }, { new: true });
        return res.json(t);
      } catch (e) {
        return res.status(500).json({ error: "Failed to update ticket" });
      }
    }
    res.json({ success: false });
  });

  app.get("/api/smsLogs", async (req, res) => {
    if (mongoDbConnected) {
      const logs = await SmsNotification.find().sort({ createdAt: -1 });
      return res.json(logs);
    }
    res.json([]);
  });

  app.get("/api/analytics/dashboard", async (req, res) => {
    if (!mongoDbConnected) return res.json({ stats: null });
    
    const activeDrivers = await Driver.countDocuments({ status: "online" });
    const ongoingRides = await Ride.countDocuments({ status: "In Progress" });
    
    // Aggregate Commission from transactions (assuming commission type transactions exist)
    const commissionResult = await Transaction.aggregate([
      { $match: { type: "Commission", status: "Deducted" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const commissionTotal = commissionResult.length > 0 ? Math.abs(commissionResult[0].total) : 0;
    
    const pendingVerifications = await Verification.countDocuments({ status: "Pending" });
    
    return res.json({
      stats: {
        activeDrivers,
        ongoingRides,
        commissionToday: commissionTotal,
        pendingVerifications
      }
    });
  });

  app.get("/api/rider/history", (req, res) => {
    res.json([
      { id: "r1", date: "2026-05-18", pickup: "Kabul University", dropoff: "Kote Sangi", fare: 120, driver: "Ahmad N.", status: "completed" },
      { id: "r2", date: "2026-05-17", pickup: "Shahr-e-Naw", dropoff: "Airport", fare: 350, driver: "Mahmoud S.", status: "completed" },
      { id: "r3", date: "2026-05-15", pickup: "Macroyan", dropoff: "Deh Afghanan", fare: 100, driver: "Zabiullah", status: "cancelled" }
    ]);
  });

  // Socket.IO Real-Time Negotiation Logic
  io.on("connection", (socket) => {
    console.log("Client connected to Socket.IO:", socket.id);
    
    // Send initial connection log to client
    socket.emit("server_log", `> [SYSTEM] Client connected with ID: ${socket.id}`);
    
    socket.on("request_ride", (payload) => {
       socket.emit("server_log", `> [RIDER] Broadcasting request: ${payload.offer} AFN, Pickup: ${payload.pickup}, Dropoff: ${payload.dropoff}`);
       
       // Broadcast to ALL OTHER connected clients (which would be drivers in a real app)
       socket.broadcast.emit("new_ride_request", {
         id: `req-${Date.now()}`,
         riderSocketId: socket.id,
         pickup: payload.pickup,
         dropoff: payload.dropoff,
         riderOffer: payload.offer,
         timestamp: new Date().toISOString()
       });
       
       // Simulate real-time backend driver bids
       setTimeout(() => {
         socket.emit("server_log", `> [DRIVER: D-101] Validating distance and sending counter-offer: 180 AFN`);
         socket.emit("bid_received", { id: "b1", driverName: "Ahmad Noor", vehicle: "Toyota Corolla", rating: 4.8, eta: "5 min", fareAmount: 180 });
       }, 2000);

       setTimeout(() => {
         socket.emit("server_log", `> [DRIVER: D-102] Sending counter-offer: 200 AFN`);
         socket.emit("bid_received", { id: "b2", driverName: "Mahmoud S.", vehicle: "Honda Civic", rating: 4.5, eta: "3 min", fareAmount: 200 });
       }, 4500);
    });

    socket.on("submit_bid", (payload) => {
       socket.emit("server_log", `> [DRIVER] Sent bid of ${payload.fareAmount} AFN to rider`);
       // Find the rider and send them the bid
       io.to(payload.riderSocketId).emit("bid_received", {
         id: `bid-${Date.now()}`,
         driverSocketId: payload.driverSocketId,
         driverName: "You (Real Driver)",
         vehicle: "Your Car",
         rating: 5.0,
         eta: "1 min",
         fareAmount: payload.fareAmount
       });
    });

    socket.on("accept_bid", (bid) => {
       socket.emit("server_log", `> [SYSTEM] Rider accepted bid from ${bid.driverName} for ${bid.fareAmount} AFN.`);
       socket.emit("server_log", `> [SYSTEM] Closing negotiation room & commencing active tracking...`);
       if (bid.driverSocketId) {
         io.to(bid.driverSocketId).emit("ride_accepted", {
           riderSocketId: bid.riderSocketId,
           bid: bid
         });
       }
    });

    socket.on("driver_location_update", (payload) => {
      io.to(payload.riderSocketId).emit("driver_location_update", payload);
    });

    socket.on("chat_message", (payload) => {
      io.to(payload.targetSocketId).emit("chat_message", payload);
    });

    socket.on("ride_status_update", async (payload) => {
      io.to(payload.riderSocketId).emit("ride_status_update", payload);
      
      // If driver is updating status (e.g., "Arrived" or "Accepted"), check if rider is actually connected.
      // If rider is missing from connected clients, simulate an SMS to them.
      const riderSocket = io.sockets.sockets.get(payload.riderSocketId);
      if (!riderSocket) {
         let message = "";
         if (payload.status === "Driver Arrived") {
           message = `HamRah SMS: Your driver is waiting for you at the pickup location. (Driver ID: ${socket.id})`;
         } else if (payload.status === "En Route to Pickup") {
           message = `HamRah SMS: Driver is on the way to pick you up! Tracking is active.`;
         } else if (payload.status === "Ride Finished") {
           message = `HamRah SMS: Your ride has finished. Total: ${payload.fareAmount || 'N/A'} AFN. Thank you for using HamRah!`;
         }

         if (message) {
            // Mock Phone Number for rider since we're using socket IDs in placeholder app
            const dummyRiderPhone = "+93700000000"; 
            await sendSMS(dummyRiderPhone, message);
         }
      }
    });

    socket.on("cancel_ride", (payload) => {
      socket.emit("server_log", `> [SYSTEM] Ride cancelled by ${payload.role}. Reason: ${payload.reason}`);
      if (payload.targetSocketId) {
        io.to(payload.targetSocketId).emit("ride_cancelled", payload);
      }
    });

    socket.on("rate_rider", async (payload) => {
       socket.emit("server_log", `> [DRIVER] Rated rider with ${payload.rating} stars`);
       if (mongoDbConnected) {
         try {
           // We might need to map riderSocketId to a real Rider ID. 
           // For now, we will just update a known Rider or the first one if we can't map.
           const rider = await Rider.findOne();
           if (rider) {
             rider.reviews.push({
               rating: payload.rating,
               review: payload.review,
               date: new Date(),
               author: "Driver (Ahmad Noor)"
             });
             await rider.save();
           }
         } catch (e) {
           console.error(e);
         }
       }
    });

    
    socket.on("sos_alert", (payload) => {
      socket.emit("server_log", `> [SYSTEM] 🚨 SOS Alert triggered by ${payload.role} at ${payload.location}`);
      
      const alert = {
        id: "sos-" + Date.now(),
        role: payload.role,
        location: payload.location,
        time: new Date().toISOString(),
        socketId: socket.id,
        resolved: false
      };
      
      mockSosAlerts.unshift(alert);
      
      // Broadcast to admin or all
      io.emit("admin_sos_alert", alert);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind the HTTP server to PORT instead of the raw Express app
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server active.`);
  });
}

startServer();
