const fs = require('fs');
let code = fs.readFileSync('src/app/driver/DriverApp.tsx', 'utf8');

const importsMatch = code.match(/lucide-react";/);
if (importsMatch) {
    code = code.replace(/lucide-react";/, ' Mic, AlertTriangle } from "lucide-react";');
}

// Send SOS function
if (!code.includes('const triggerSOS')) {
    code = code.replace('const sendChatMessage = () => {', `const triggerSOS = () => {
    if(confirm("Are you sure you want to trigger SOS? This will alert admin immediately.")) {
       socket?.emit("sos_alert", { role: "Driver (ID: D-101)", location: "Current Location" });
       alert("SOS triggered. Admin dispatched.");
    }
  };
  
  const sendVoiceNote = () => {
    if (!socket || !acceptedRide) return;
    socket.emit("chat_message", {
      targetSocketId: acceptedRide.riderSocketId,
      sender: "Driver",
      message: "🎤 Voice Note (0:05s)",
      isAudio: true
    });
    setChatMessages(prev => [...prev, { sender: "You", text: "🎤 Voice Note (0:05s)" }]);
  };
  
  const sendChatMessage = () => {`);
}

if (!code.includes('sendVoiceNote')) {
    code = code.replace(/<button onClick={sendChatMessage} className="bg-amber-500 hover:bg-amber-600/, `<button onClick={sendVoiceNote} className="text-gray-400 hover:text-amber-500 p-2"><Mic size={20}/></button>
                 <button onClick={sendChatMessage} className="bg-amber-500 hover:bg-amber-600`);
}

// Update SOS button UI
if (!code.includes('triggerSOS')) {
    code = code.replace(/<h2 className="text-2xl font-bold text-gray-800">{rideStatus}<\/h2>/, `<h2 className="text-2xl font-bold text-gray-800">{rideStatus}</h2>
                   {acceptedRide && <button onClick={triggerSOS} className="absolute right-5 top-5 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full shadow-sm" title="Emergency SOS"><AlertTriangle size={20}/></button>}`);
}

fs.writeFileSync('src/app/driver/DriverApp.tsx', code);
