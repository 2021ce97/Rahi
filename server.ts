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
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        mongoDbConnected = true;
        console.log("Connected to MongoDB");
      })
      .catch((err) => console.error("MongoDB connection error:", err));
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
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Rahi Admin Backend", mongoDbConnected });
  });

  // Data Fetching APIs (Phase 6: Actual MongoDB Data with Mock Fallbacks)
  app.get("/api/drivers", async (req, res) => {
    if (mongoDbConnected) {
      try {
        const drivers = await Driver.find().sort({ createdAt: -1 });
        return res.json(drivers.length > 0 ? drivers : db.mockDrivers);
      } catch (err) {
        // Fallback to mock on error
      }
    }
    res.json(db.mockDrivers);
  });

  app.get("/api/riders", async (req, res) => {
    if (mongoDbConnected) {
      try {
        const riders = await Rider.find().sort({ createdAt: -1 });
        return res.json(riders.length > 0 ? riders : db.mockRiders);
      } catch (err) { }
    }
    res.json(db.mockRiders);
  });

  app.get("/api/rides", async (req, res) => {
    if (mongoDbConnected) {
      try {
        const rides = await Ride.find().sort({ createdAt: -1 });
        return res.json(rides.length > 0 ? rides : db.mockRides);
      } catch (err) { }
    }
    res.json(db.mockRides);
  });
  
  app.get("/api/transactions", (req, res) => {
     res.json(db.mockTransactions);
  });

  app.get("/api/zones", (req, res) => {
     res.json(db.mockZones);
  });

  app.get("/api/diaspora", (req, res) => {
     res.json(db.mockDiasporaGifts);
  });

  // Example API: Driver Verifications (Mock Backend integration)
  app.get("/api/verifications", (req, res) => {
     res.json(db.mockVerifications);
  });

  // Socket.IO Real-Time Negotiation Logic
  io.on("connection", (socket) => {
    console.log("Client connected to Socket.IO:", socket.id);
    
    // Send initial connection log to client
    socket.emit("server_log", `> [SYSTEM] Client connected with ID: ${socket.id}`);
    
    socket.on("request_ride", (payload) => {
       socket.emit("server_log", `> [RIDER] Broadcasting request: ${payload.offer} AFN, Pickup: ${payload.pickup}, Dropoff: ${payload.dropoff}`);
       
       // Simulate real-time backend driver bids
       setTimeout(() => {
         socket.emit("server_log", `> [DRIVER: D-101] Validating distance and sending counter-offer: 180 AFN`);
         socket.emit("bid_received", { id: "b1", driverName: "Ahmad Noor", vehicle: "Toyota Corolla", rating: 4.8, eta: "5 min", fareAmount: 180 });
       }, 2000);

       setTimeout(() => {
         socket.emit("server_log", `> [DRIVER: D-102] Sending counter-offer: 200 AFN`);
         socket.emit("bid_received", { id: "b2", driverName: "Mahmoud S.", vehicle: "Honda Civic", rating: 4.5, eta: "3 min", fareAmount: 200 });
       }, 4500);

       setTimeout(() => {
         socket.emit("server_log", `> [DRIVER: D-103] Accepting initial offer: 150 AFN`);
         socket.emit("bid_received", { id: "b3", driverName: "Zabiullah", vehicle: "Toyota Fielder", rating: 4.9, eta: "7 min", fareAmount: 150 });
       }, 7000);
    });

    socket.on("accept_bid", (bid) => {
       socket.emit("server_log", `> [SYSTEM] Rider accepted bid from ${bid.driverName} for ${bid.fareAmount} AFN.`);
       socket.emit("server_log", `> [SYSTEM] Closing negotiation room & commencing active tracking...`);
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
