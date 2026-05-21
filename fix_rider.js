const fs = require('fs');
let code = fs.readFileSync('src/app/rider/RiderApp.tsx', 'utf8');

const importsMatch = code.match(/lucide-react";/);
if (importsMatch) {
    code = code.replace(/lucide-react";/, ' Mic, AlertTriangle, Info, Phone } from "lucide-react";');
}

// Add state for badges and SOS
const stateMatch = code.match(/const \[liveETA, setLiveETA\] = useState\("");/);
if (stateMatch && !code.includes('const [selectedBadges')) {
    code = code.replace('const [liveETA, setLiveETA] = useState("");', `const [liveETA, setLiveETA] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const BADGES = ["Clean Car", "Safe Driving", "Great Music", "Friendly"];`);
}

// Send SOS function
const handlersMatch = code.match(/const sendChatMessage = \(\) => {/);
if (handlersMatch && !code.includes('const triggerSOS')) {
    code = code.replace('const sendChatMessage = () => {', `const triggerSOS = () => {
    if(confirm("Are you sure you want to trigger SOS? This will alert admin immediately.")) {
       socket?.emit("sos_alert", { role: "Rider", location: pickup || "Unknown Location" });
       alert("SOS triggered. Admin dispatched.");
    }
  };
  
  const sendVoiceNote = () => {
    if (!socket || !acceptedBid) return;
    socket.emit("chat_message", {
      targetSocketId: acceptedBid.driverSocketId,
      sender: "Rider",
      message: "🎤 Voice Note (0:05s)",
      isAudio: true
    });
    setChatMessages(prev => [...prev, { sender: "You", text: "🎤 Voice Note (0:05s)" }]);
  };
  
  const sendChatMessage = () => {`);
}

// Update voice note icon
const chatInputMatch = code.match(/<button onClick={sendChatMessage} className="bg-amber-500 hover:bg-amber-600/);
if (chatInputMatch && !code.includes('sendVoiceNote')) {
    code = code.replace(/<button onClick={sendChatMessage} className="bg-amber-500 hover:bg-amber-600/, `<button onClick={sendVoiceNote} className="text-gray-400 hover:text-amber-500 p-2"><Mic size={20}/></button>
                 <button onClick={sendChatMessage} className="bg-amber-500 hover:bg-amber-600`);
}

// Update SOS button UI
const uiMatch = code.match(/<h2 className="text-2xl font-bold text-gray-800">{rideStatus}<\/h2>/);
if (uiMatch && !code.includes('triggerSOS')) {
    code = code.replace(/<h2 className="text-2xl font-bold text-gray-800">{rideStatus}<\/h2>/, `<h2 className="text-2xl font-bold text-gray-800">{rideStatus}</h2>
                   {acceptedBid && <button onClick={triggerSOS} className="absolute right-5 top-5 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full shadow-sm" title="Emergency SOS"><AlertTriangle size={20}/></button>}`);
}

// Update badges on ride finish
const ratingMatch = code.match(/<div>\n\s*<h3 className="font-bold text-lg mb-2">/);
if (ratingMatch && !code.includes('selectedBadges.includes(b)')) {
    code = code.replace(/<div>\n\s*<h3 className="font-bold text-lg mb-2">/, `<div className="flex flex-wrap gap-2 mt-4 mb-4 justify-center">
                    {BADGES.map(b => (
                       <button
                         key={b}
                         onClick={() => setSelectedBadges(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])}
                         className={\`px-3 py-1 rounded-full text-xs font-semibold border \${selectedBadges.includes(b) ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-500'}\`}
                       >
                         {b}
                       </button>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">`);
}

// Emitting rating with badges
const rateEventMatch = code.match(/rating: rating/);
if (rateEventMatch) {
    code = code.replace(/rating: rating/, `rating: rating, badges: selectedBadges`);
}

// Adding USSD fallback note (Phase 19)
const ussdMatch = code.match(/You have no active or requesting rides\./);
if (ussdMatch && !code.includes('*123#')) {
   code = code.replace(/You have no active or requesting rides\./, `You have no active or requesting rides. If offline, dial *123# or scan USSD.`);
}

fs.writeFileSync('src/app/rider/RiderApp.tsx', code);
