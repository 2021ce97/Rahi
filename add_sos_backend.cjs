const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sosApi = `
  let mockSosAlerts = [];
  app.get("/api/sos", (req, res) => {
    res.json(mockSosAlerts);
  });
`;

if (!code.includes('/api/sos')) {
    code = code.replace('app.get("/api/health"', sosApi + '\n  app.get("/api/health"');
}

const sosEvent = `
    socket.on("sos_alert", (payload) => {
      socket.emit("server_log", \`> [SYSTEM] 🚨 SOS Alert triggered by \${payload.role} at \${payload.location}\`);
      
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
`;

if (!code.includes('socket.on("sos_alert"')) {
    code = code.replace('socket.on("disconnect"', sosEvent + '\n    socket.on("disconnect"');
}

fs.writeFileSync('server.ts', code);
