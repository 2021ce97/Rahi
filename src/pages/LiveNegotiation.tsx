import { useState, useEffect } from "react";
import { Send, CheckCircle2, User, Car } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { io, Socket } from "socket.io-client";

interface Bid {
  id: string;
  driverName: string;
  vehicle: string;
  rating: number;
  eta: string;
  fareAmount: number;
}

export default function LiveNegotiation() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [status, setStatus] = useState<"not_started" | "pending" | "matched">("not_started");
  const [acceptedBid, setAcceptedBid] = useState<Bid | null>(null);
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize Socket.io Connection
  useEffect(() => {
    const newSocket = io();
    
    newSocket.on("connect", () => {
       console.log("Connected to Backend Socket.IO");
    });
    
    newSocket.on("server_log", (logLine: string) => {
       setServerLogs(prev => [...prev, logLine]);
    });

    newSocket.on("bid_received", (bid: Bid) => {
       setBids(prev => [...prev, bid]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const triggerRequest = () => {
     if (!socket) return;
     setBids([]);
     setStatus("pending");
     setServerLogs(["> [SYSTEM] Initializing ride-request channel..."]);
     socket.emit("request_ride", { pickup: "PD6 Mosque", dropoff: "Kabul University", offer: 150 });
  };

  const handleAccept = (bid: Bid) => {
    setAcceptedBid(bid);
    setStatus("matched");
    socket?.emit("accept_bid", bid);
  };
  
  const resetDemo = () => {
    setBids([]); 
    setStatus("not_started"); 
    setAcceptedBid(null);
    setServerLogs([]);
  };

  return (
    <div className="space-y-6 pb-6 max-w-4xl mx-auto flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ride Negotiation Simulator</h1>
          <p className="text-sm text-gray-500">Live WebSockets connected to Node.js backend.</p>
        </div>
        <button 
          onClick={resetDemo}
          className="text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300 transition-colors"
        >
          Reset Demo
        </button>
      </div>

      <div className="flex gap-6 min-h-[500px]">
        {/* Rider View */}
        <div className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
           <div className="bg-gray-950 p-4 shrink-0">
             <div className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">Rider View</div>
             <h2 className="text-white font-medium">Requesting Ride</h2>
           </div>
           
           <div className="p-4 border-b border-gray-100 shrink-0 bg-gray-50">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <div className="text-sm flex-1">PD6 Mosque</div>
             </div>
             <div className="w-0.5 h-4 bg-gray-300 ml-1 my-1"></div>
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <div className="text-sm flex-1">Kabul University</div>
             </div>
             
             <div className="mt-4 flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg">
               <span className="text-sm text-gray-500">Initial Offer:</span>
               <span className="font-bold text-lg text-gray-900">150 AFN</span>
             </div>
           </div>

           <div className="p-4 flex-1 overflow-y-auto bg-gray-50 flex flex-col">
             {status === "not_started" ? (
                <div className="m-auto text-center">
                   <button onClick={triggerRequest} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform active:scale-95">
                      Request Ride via Socket.IO
                   </button>
                </div>
             ) : status === "pending" ? (
               <>
                 <div className="text-center text-sm text-gray-500 mb-4 animate-pulse">
                   Waiting for driver bids over WebSocket...
                 </div>
                 <div className="space-y-3">
                   <AnimatePresence>
                     {bids.map((bid) => (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         key={bid.id} 
                         className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm relative overflow-hidden"
                       >
                         <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                         <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                               <User size={14} className="text-gray-500"/>
                             </div>
                             <div>
                               <div className="font-medium text-sm text-gray-900">{bid.driverName}</div>
                               <div className="text-xs text-gray-500 flex items-center gap-1">⭐ {bid.rating} • {bid.vehicle}</div>
                             </div>
                           </div>
                           <div className="text-right">
                             <div className="font-bold text-lg text-gray-900">{bid.fareAmount} AFN</div>
                             <div className="text-xs text-green-600 font-medium">ETA: {bid.eta}</div>
                           </div>
                         </div>
                         <button 
                           onClick={() => handleAccept(bid)}
                           className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm py-2 rounded transition-colors flex items-center justify-center gap-2"
                         >
                           <CheckCircle2 size={16} /> Accept {bid.fareAmount} AFN
                         </button>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
               </>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center p-6">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                   <CheckCircle2 size={32} className="text-green-600" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-1">Ride Confirmed!</h3>
                 <p className="text-sm text-gray-500 mb-4">{acceptedBid?.driverName} is arriving in {acceptedBid?.eta}</p>
                 <div className="bg-white p-4 rounded-lg border border-gray-200 w-full shadow-sm text-left">
                   <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Agreed Fare:</span><span className="font-bold">{acceptedBid?.fareAmount} AFN</span></div>
                   <div className="flex justify-between text-sm"><span className="text-gray-500">Vehicle:</span><span className="font-medium">{acceptedBid?.vehicle}</span></div>
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* Server Log / State info */}
        <div className="w-1/2 bg-gray-900 rounded-xl overflow-hidden shadow-lg p-6 flex flex-col font-mono text-xs">
          <div className="flex justify-between items-center text-gray-400 mb-4 border-b border-gray-800 pb-2">
            <span>Socket.IO Live Relay</span>
            <span className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div> Connected</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 text-green-400">
             {serverLogs.map((log, index) => 
               <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={log.includes("DRIVER:") ? "text-blue-300" : log.includes("RIDER") ? "text-amber-400" : "text-green-400"}>
                 {log}
               </motion.div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
