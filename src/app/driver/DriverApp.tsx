import React, { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { MapPin, Navigation, DollarSign, Signal, Clock, User, XCircle, Star, Edit2, Check, AlertCircle, FileText, Upload, Loader2, LogOut } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapDirections } from '../components/MapDirections';
import { motion, AnimatePresence } from "motion/react";

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface RideRequest {
  id: string;
  riderSocketId: string;
  pickup: string;
  dropoff: string;
  riderOffer: number;
  timestamp: string;
}

function useDriverNegotiation(socket: Socket | null) {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);
  const [activeRide, setActiveRide] = useState<any>(null); // holds riderSocketId, pickup, dropoff etc.
  const [driverStatus, setDriverStatus] = useState<"En route to pickup" | "Arrived at pickup" | "In ride" | "End ride" | "">("");

  const submitBid = useCallback((bidAmount: string) => {
    if (!socket || !activeRequest || !bidAmount) return;
    
    socket.emit("submit_bid", {
      riderSocketId: activeRequest.riderSocketId,
      fareAmount: parseInt(bidAmount, 10),
      requestId: activeRequest.id
    });
    
    setRequests(prev => prev.filter(r => r.id !== activeRequest.id));
    setActiveRequest(null);
  }, [socket, activeRequest]);

  const declineRequest = useCallback(() => {
    if (!activeRequest) return;
    setRequests(prev => prev.filter(r => r.id !== activeRequest.id));
    setActiveRequest(null);
  }, [activeRequest]);

  const updateStatus = useCallback((status: any) => {
    setDriverStatus(status);
    if (socket && activeRide) {
      socket.emit("ride_status_update", {
        riderSocketId: activeRide.riderSocketId,
        status: status
      });
    }
    if (status === "End ride") {
      setActiveRide(null);
      setDriverStatus("");
    }
  }, [socket, activeRide]);

  const resetRide = useCallback(() => {
    setActiveRide(null);
    setDriverStatus("");
  }, []);

  return {
    requests,
    setRequests,
    activeRequest,
    setActiveRequest,
    activeRide,
    setActiveRide,
    driverStatus,
    setDriverStatus,
    submitBid,
    declineRequest,
    updateStatus,
    resetRide
  };
}

export default function DriverApp() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'profile'>('home');
  const [isOnline, setIsOnline] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>("");
  
  // Profile state
  const [earnings, setEarnings] = useState({ today: 450, week: 3200, month: 12500 });
  const [vehicle, setVehicle] = useState({ make: 'Toyota', model: 'Corolla', year: '2015', color: 'White', plate: 'KBL-12345' });
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);

  // Status Modals
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [showEndRideModal, setShowEndRideModal] = useState(false);

  
  // Document Upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<{name: string, type: string}[]>([]);

  // Rating Modal
  const [rideToRate, setRideToRate] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [riderRating, setRiderRating] = useState(5);
  const [riderReview, setRiderReview] = useState("");
  
  // Offline Warning
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  const {
    requests,
    setRequests,
    activeRequest,
    setActiveRequest,
    activeRide,
    setActiveRide,
    driverStatus,
    setDriverStatus,
    submitBid,
    declineRequest,
    updateStatus,
    resetRide
  } = useDriverNegotiation(socket);

  // Tracking & Status
  const [driverLocation, setDriverLocation] = useState({lat: 34.5281, lng: 69.1723});
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // Cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // Load state from local storage on mount
    const savedState = localStorage.getItem('driver_app_state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setIsOnline(state.isOnline || false);
        if (state.activeRide) {
          setActiveRide(state.activeRide);
          setDriverStatus(state.driverStatus || "En route to pickup");
        }
        if (state.earnings) setEarnings(state.earnings);
        if (state.vehicle) setVehicle(state.vehicle);
      } catch (e) {
        console.error("Failed to restore driver state", e);
      }
    }

    // Connect to Socket.io
    const newSocket = io(window.location.host);
    setSocket(newSocket);

    newSocket.on("new_ride_request", (req: RideRequest) => {
      setRequests((prev) => [req, ...prev]);
    });

    newSocket.on("ride_accepted", (payload) => {
      setActiveRide(payload.bid);
      setDriverStatus("En route to pickup");
      setRequests([]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rider Accepted!', { body: `Rider accepted your bid of ${payload.bid.fareAmount} AFN.` });
      }
    });

    newSocket.on("ride_cancelled", () => {
       alert("The rider cancelled the ride.");
       resetRide();
       setChatMessages([]);
       setShowCancelModal(false);
    });

    newSocket.on("chat_message", (payload) => {
      setChatMessages(prev => [...prev, { sender: payload.sender, text: payload.message }]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Save state to local storage when relevant state changes
    if (activeRide || isOnline) {
      localStorage.setItem('driver_app_state', JSON.stringify({
        isOnline,
        activeRide,
        driverStatus,
        earnings,
        vehicle
      }));
    } else {
      localStorage.removeItem('driver_app_state');
    }
  }, [isOnline, activeRide, driverStatus, earnings, vehicle]);

  // Simulate driver movement
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRide && driverStatus !== "End ride" && socket) {
      interval = setInterval(() => {
        setDriverLocation(prev => {
          // move slightly towards north-east
          const newLoc = { lat: prev.lat + 0.0001, lng: prev.lng + 0.0001 };
          socket.emit("driver_location_update", {
            riderSocketId: activeRide.riderSocketId,
            lat: newLoc.lat,
            lng: newLoc.lng
          });
          return newLoc;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeRide, driverStatus, socket]);

  const sendChatMessage = () => {
    if (!newMessage.trim() || !socket || !activeRide) return;
    socket.emit("chat_message", {
      targetSocketId: activeRide.riderSocketId,
      sender: "Driver",
      message: newMessage
    });
    setChatMessages(prev => [...prev, { sender: "You", text: newMessage }]);
    setNewMessage("");
  };

  const handleEndRide = () => {
    if (!activeRide) return;
    setEarnings(prev => ({
      today: prev.today + activeRide.fareAmount,
      week: prev.week + activeRide.fareAmount,
      month: prev.month + activeRide.fareAmount,
    }));
    const finishedRide = { ...activeRide };
    updateStatus("End ride");
    setShowEndRideModal(false);
    
    // Prompt for rating
    setRideToRate(finishedRide);
    setRiderRating(5);
    setRiderReview("");
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (socket && rideToRate) {
       socket.emit("rate_rider", {
          riderSocketId: rideToRate.riderSocketId,
          rating: riderRating,
          review: riderReview
       });
    }
    setShowRatingModal(false);
    setRideToRate(null);
  };

  const handleArrivalWithDelay = () => {
    if (delayReason) {
      // Assuming server would broadcast this to rider if we implemented it fully
      socket?.emit("chat_message", {
        targetSocketId: activeRide.riderSocketId,
        sender: "Driver",
        message: `Status: Arriving late. Reason: ${delayReason}`
      });
      setChatMessages(prev => [...prev, { sender: "You", text: `Sent update: Arriving late (${delayReason})` }]);
    }
    updateStatus("Arrived at pickup");
    setShowArrivalModal(false);
    setDelayReason("");
  };

  const handleToggleOnline = () => {
    if (isOnline && activeRide) {
       setShowOfflineModal(true);
       return;
    }
    setIsOnline(!isOnline);
    if (!isOnline) {
      setRequests([]); // clear old requests when going online
    }
  };

  const confirmOffline = () => {
     setShowOfflineModal(false);
     setIsOnline(false);
  };

  const handleRespond = (req: RideRequest) => {
    setActiveRequest(req);
    setBidAmount(req.riderOffer.toString());
  };

  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center p-6 h-screen font-sans bg-gray-900 flex-col">
        <div className="text-center max-w-md bg-gray-800 p-6 rounded-xl shadow-lg border border-red-900">
          <h2 className="text-xl font-bold text-red-400 mb-4">Google Maps API Key Required</h2>
          <p className="mb-4 text-gray-300 text-sm"><strong>Step 1:</strong> <a className="text-blue-400 underline" href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener">Get an API Key</a></p>
          <p className="mb-4 text-gray-300 text-sm"><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul className="text-left text-sm text-gray-400 space-y-2 list-disc pl-5">
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code className="bg-gray-700 px-1 rounded text-red-400">GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p className="mt-4 text-gray-500 text-xs text-left">The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-900 text-gray-100 font-sans shadow-xl border-x border-gray-800 relative overflow-hidden">
        
        {/* Background Map */}
        <div className="absolute inset-0 z-0">
          <Map
            defaultCenter={{lat: 34.5281, lng: 69.1723}} // Kabul
            center={driverLocation}
            defaultZoom={11}
            mapId="DRIVER_DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{width: '100%', height: '100%'}}
            disableDefaultUI={true}
          >
            <AdvancedMarker position={driverLocation}>
              <div className="bg-blue-500 rounded-full w-4 h-4 shadow-lg border-2 border-white"></div>
            </AdvancedMarker>
            {activeRide && (
              <MapDirections origin={activeRide.pickup} destination={activeRide.dropoff} />
            )}
          </Map>
        </div>

        {/* Header */}
        <div className="bg-gray-800/90 backdrop-blur-md p-4 shadow-sm border-b border-gray-700 flex justify-between items-center relative z-10 mt-0 safe-top">
          <div className="font-bold text-lg text-white">Rahi - Driver</div>
          <button
            onClick={handleToggleOnline}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              isOnline ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-300"
            }`}
          >
            <Signal size={16} className="mr-2" />
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col relative z-10 pointer-events-none pb-6 justify-end">
          <div className="pointer-events-auto">
        {!isOnline ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 text-gray-500">
            <Signal size={64} className="text-gray-700" />
            <h2 className="text-xl font-bold text-gray-400">You are offline</h2>
            <p>Go online to receive ride requests and start earning.</p>
          </div>
        ) : activeRide ? (
          <div className="flex-1 flex flex-col pointer-events-auto bg-gray-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-x border-gray-700 p-5 mt-auto">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h2 className="text-2xl font-bold text-white">{driverStatus}</h2>
                  <p className="text-gray-400 text-sm mt-1">Passenger: The Rider</p>
               </div>
               <div className="text-right">
                  <div className="text-xl font-bold text-amber-500">{activeRide.fareAmount} ؋</div>
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Agreed Fare</div>
                  {driverStatus !== "End ride" && (
                    <button onClick={() => setShowCancelModal(true)} className="text-red-400 hover:text-red-300 text-sm underline">Cancel</button>
                  )}
               </div>
            </div>

            <div className="flex gap-2 mb-4">
              {driverStatus === "En route to pickup" && (
                <button onClick={() => setShowArrivalModal(true)} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-lg transition-colors">Confirm Arrival</button>
              )}
              {driverStatus === "Arrived at pickup" && (
                <button onClick={() => updateStatus("In ride")} className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg transition-colors">Start Ride</button>
              )}
              {driverStatus === "In ride" && (
                <button onClick={() => setShowEndRideModal(true)} className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg transition-colors">End Ride & Collect Payment</button>
              )}
            </div>

            <div className="flex-1 flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden max-h-48 mb-2">
              <div className="bg-gray-700 px-3 py-2 text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-gray-600">
                Chat with Rider
              </div>
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                 {chatMessages.length === 0 && <div className="text-gray-500 text-xs text-center mt-4">No messages yet.</div>}
                 {chatMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.sender === 'You' ? 'bg-amber-500 text-gray-900 rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                        {msg.text}
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-2 bg-gray-750 flex gap-2">
                 <input 
                    type="text" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                 />
                 <button onClick={sendChatMessage} className="bg-amber-500 text-gray-900 px-3 py-1.5 rounded font-bold text-sm">Send</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Active Negotiation Overlay */}
            {activeRequest && (
              <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm z-20 flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-6">
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">New Ride Request</h2>
                    <p className="text-gray-400 text-sm">Respond to the rider's offer</p>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-4">
                    <div className="flex items-start">
                      <Navigation className="text-blue-400 mt-1 mr-3 shrink-0" size={18} />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Pickup</div>
                        <div className="text-gray-200">{activeRequest.pickup}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="text-red-400 mt-1 mr-3 shrink-0" size={18} />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Dropoff</div>
                        <div className="text-gray-200">{activeRequest.dropoff}</div>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4 mt-2 flex justify-between items-center">
                      <div className="text-gray-400">Rider Offer:</div>
                      <div className="text-2xl font-bold text-amber-500">{activeRequest.riderOffer} ؋</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Your Counter Offer (AFN)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-4 text-green-500">
                          <DollarSign size={20} />
                        </div>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full bg-gray-800 border-2 border-amber-500/50 rounded-xl py-4 pl-12 pr-4 text-white text-xl font-bold focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={declineRequest}
                        className="flex-1 bg-gray-800 text-gray-300 rounded-xl py-4 font-bold hover:bg-gray-700 transition-colors"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => submitBid(bidAmount)}
                        className="flex-[2] bg-amber-500 text-gray-900 rounded-xl py-4 font-bold text-lg hover:bg-amber-400 transition-colors"
                      >
                        Send Offer
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* List of Requests */}
            <div className="space-y-4 pb-6">
              <div className="flex justify-between items-end mb-4 px-1">
                <h3 className="font-bold text-gray-400">Available Rides</h3>
                <span className="bg-gray-800 px-2 py-1 rounded-full text-xs font-bold text-gray-400 border border-gray-700">
                  {requests.length} Nearby
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-600 space-y-4">
                  <div className="w-12 h-12 border-4 border-gray-700 border-t-amber-500 rounded-full animate-spin"></div>
                  <p>Searching for nearby riders...</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700/50 hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center text-gray-300 font-medium mb-1">
                          <Navigation size={14} className="text-blue-400 mr-2" />
                          {req.pickup}
                        </div>
                        <div className="flex items-center text-gray-300 font-medium">
                          <MapPin size={14} className="text-red-400 mr-2" />
                          {req.dropoff}
                        </div>
                      </div>
                      <div className="text-right pl-3 border-l border-gray-700">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Offer</div>
                        <div className="text-xl font-bold text-amber-500">{req.riderOffer} ؋</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRespond(req)}
                      className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors border border-gray-600"
                    >
                      Respond to Rider
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
          </div>
        </div>

        {/* Arrival Modal */}
        <AnimatePresence>
          {showArrivalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 w-full max-w-sm p-6 flex flex-col"
              >
                <h3 className="text-xl font-bold text-white mb-2">Confirm Arrival</h3>
                <p className="text-gray-400 mb-4 text-sm">Let the rider know you are here. If you are delayed, select a reason to notify them automatically.</p>
                
                <select
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500 mb-6"
                  value={delayReason}
                  onChange={e => setDelayReason(e.target.value)}
                >
                  <option value="">I have arrived (No delay)</option>
                  <option value="Traffic">Delayed by traffic (Arriving shortly)</option>
                  <option value="Road closure">Road closure (Finding route)</option>
                </select>

                <div className="flex gap-3">
                  <button onClick={() => { setShowArrivalModal(false); setDelayReason(""); }} className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg font-bold">Cancel</button>
                  <button
                    onClick={handleArrivalWithDelay}
                    className="flex-1 px-4 py-3 bg-amber-500 text-gray-900 rounded-lg font-bold"
                  >Confirm</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* End Ride Modal */}
        <AnimatePresence>
          {showEndRideModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 w-full max-w-sm p-6 flex flex-col text-center shadow-[0_0_50px_rgba(34,197,94,0.1)]"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Finish Ride?</h3>
                <p className="text-gray-400 mb-6 text-sm">Please confirm you have reached the destination and collected full payment.</p>
                
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6">
                   <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">To Collect</div>
                   <div className="text-3xl font-bold text-green-500">{activeRide?.fareAmount} ؋</div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowEndRideModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg font-bold">Not Yet</button>
                  <button
                    onClick={handleEndRide}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-bold shadow-lg shadow-green-500/20"
                  >Confirm & Collect</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 w-full max-w-sm p-6 flex flex-col"
              >
                <div className="flex items-center text-red-400 mb-4">
                  <XCircle size={28} className="mr-2" />
                  <h3 className="text-xl font-bold text-white">Cancel Ride?</h3>
                </div>
                <p className="text-gray-400 mb-4">Please select a reason for cancelling.</p>
                <select
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-amber-500 mb-6"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Vehicle issue">Vehicle issue</option>
                  <option value="Traffic">Too much traffic</option>
                  <option value="Passenger not responding">Passenger not responding</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex gap-3">
                  <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg font-bold">Nevermind</button>
                  <button
                    disabled={!cancelReason}
                    onClick={() => {
                        socket?.emit("cancel_ride", { role: "Driver", reason: cancelReason, targetSocketId: activeRide?.riderSocketId });
                        resetRide();
                        setChatMessages([]);
                        setShowCancelModal(false);
                        setCancelReason("");
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-bold disabled:opacity-50"
                  >Confirm</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offline Warning Modal */}
        <AnimatePresence>
           {showOfflineModal && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
             >
                <motion.div
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 w-full max-w-sm p-6 flex flex-col items-center text-center"
               >
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                    <LogOut size={28} className="text-red-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Go Offline?</h3>
                 <p className="text-gray-400 mb-6 text-sm">You are currently in an active ride. Going offline could disrupt the passenger's experience. Are you sure you want to go offline?</p>

                 <div className="flex gap-3 w-full">
                    <button onClick={() => setShowOfflineModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg font-bold">Stay Online</button>
                    <button onClick={confirmOffline} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-bold">Go Offline</button>
                 </div>
               </motion.div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Rating Modal */}
        <AnimatePresence>
           {showRatingModal && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
             >
                <motion.div
                 initial={{ scale: 0.95 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.95 }}
                 className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 w-full max-w-sm p-6 flex flex-col text-center"
               >
                 <h3 className="text-2xl font-bold text-white mb-2">Rate the Rider</h3>
                 <p className="text-gray-400 mb-6 text-sm">How was your experience with this passenger?</p>

                 <div className="flex justify-center space-x-2 mb-6">
                    {[1, 2, 3, 4, 5].map(star => (
                       <button
                         key={star}
                         onClick={() => setRiderRating(star)}
                         className="focus:outline-none transition-transform hover:scale-110"
                       >
                         <Star size={36} className={star <= riderRating ? "text-amber-500 fill-amber-500" : "text-gray-600"} />
                       </button>
                    ))}
                 </div>

                 <textarea
                   className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500 mb-6 resize-none h-24"
                   placeholder="Write a short review..."
                   value={riderReview}
                   onChange={e => setRiderReview(e.target.value)}
                 />

                 <div className="flex gap-3 w-full">
                    <button onClick={submitRating} className="flex-1 px-4 py-3 bg-amber-500 text-gray-900 rounded-lg font-bold shadow-lg">Submit Feedback</button>
                 </div>
               </motion.div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Profile View Overlay */}
        {currentTab === 'profile' && (
          <div className="absolute inset-0 z-30 bg-gray-900 overflow-y-auto pt-[70px] pb-[70px]">
             <div className="p-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-amber-500">
                     <User size={36} className="text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Ahmad Noor</h2>
                    <div className="flex items-center text-amber-500 mt-1">
                       <Star size={16} className="fill-current mr-1" /> 4.8 Rating
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Tazkira Status</div>
                      <div className="flex items-center text-green-400 font-bold">
                         <Signal size={16} className="mr-2" /> Verified
                      </div>
                      <p className="text-xs text-gray-500 mt-2">National ID has been securely verified by Admin.</p>
                   </div>
                   
                   <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
                         Documents
                         <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-[10px]">Optional</span>
                      </div>
                      <div className="space-y-3">
                         {uploadedDocs.map((doc, idx) => (
                           <div key={idx} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-2">
                             <div className="flex items-center overflow-hidden">
                               <FileText size={16} className="text-amber-500 mr-2 shrink-0" />
                               <div className="truncate">
                                 <div className="text-sm font-bold text-white truncate max-w-[200px]">{doc.name}</div>
                                 <div className="text-[10px] text-gray-500 uppercase">{doc.type || 'Document'}</div>
                               </div>
                             </div>
                             <Check size={16} className="text-green-500 shrink-0 ml-2" />
                           </div>
                         ))}
                         
                         {isUploading && (
                           <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <Loader2 size={14} className="text-amber-500 animate-spin mr-2" />
                                  <div className="text-xs text-gray-400 font-medium">Uploading...</div>
                                </div>
                                <div className="text-xs text-amber-500 font-mono">{uploadProgress}%</div>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                 <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                              </div>
                           </div>
                         )}

                         <div className="relative">
                            <input 
                              type="file" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              onChange={(e) => {
                                 if (e.target.files && e.target.files.length > 0) {
                                   const file = e.target.files[0];
                                   if (!file) return;
                                   setIsUploading(true);
                                   setUploadProgress(0);
                                   const interval = setInterval(() => {
                                      setUploadProgress(prev => {
                                        if (prev >= 100) {
                                           clearInterval(interval);
                                           setIsUploading(false);
                                           setUploadedDocs(prevDocs => [...prevDocs, { name: file.name, type: file.type || 'Document' }]);
                                           return 0;
                                        }
                                        return prev + 15;
                                      });
                                   }, 200);
                                 }
                              }}
                            />
                            <div className="flex items-center justify-center bg-gray-750 hover:bg-gray-700 border border-gray-600 border-dashed rounded-lg py-3 transition-colors">
                               <Upload size={16} className="text-amber-500 mr-2" />
                               <span className="text-sm font-bold text-gray-300">Upload Registration / Insurance</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Vehicle Details</div>
                        <button 
                          onClick={() => setIsEditingVehicle(!isEditingVehicle)}
                          className="text-amber-500 p-1 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {isEditingVehicle ? <Check size={16} /> : <Edit2 size={16} />}
                        </button>
                      </div>

                      {isEditingVehicle ? (
                        <div className="space-y-3">
                          <input type="text" value={vehicle.make} onChange={e => setVehicle({...vehicle, make: e.target.value})} placeholder="Make" className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
                          <div className="flex gap-2">
                             <input type="text" value={vehicle.model} onChange={e => setVehicle({...vehicle, model: e.target.value})} placeholder="Model" className="w-1/2 bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
                             <input type="text" value={vehicle.year} onChange={e => setVehicle({...vehicle, year: e.target.value})} placeholder="Year" className="w-1/2 bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
                          </div>
                          <div className="flex gap-2">
                            <input type="text" value={vehicle.color} onChange={e => setVehicle({...vehicle, color: e.target.value})} placeholder="Color" className="w-1/2 bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
                            <input type="text" value={vehicle.plate} onChange={e => setVehicle({...vehicle, plate: e.target.value})} placeholder="Plate" className="w-1/2 bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:border-amber-500 focus:outline-none uppercase" />
                          </div>
                          <button 
                            onClick={() => setIsEditingVehicle(false)}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-lg transition-colors mt-2"
                          >
                            Save Vehicle Details
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-white font-bold text-lg">{vehicle.make} {vehicle.model} {vehicle.year}</div>
                          <div className="flex justify-between items-center mt-2">
                             <div className="text-gray-400 text-sm">Plate: <span className="font-mono text-white tracking-wider">{vehicle.plate.toUpperCase()}</span></div>
                             <div className="text-gray-400 text-sm">Color: <span className="text-white">{vehicle.color}</span></div>
                          </div>
                        </>
                      )}
                   </div>

                   <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                           <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Earnings Breakdown</div>
                           <div className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">+12% vs Yesterday</div>
                        </div>

                        <div className="space-y-4">
                           <div>
                              <div className="text-gray-500 text-sm mb-1">Today</div>
                              <div className="grid grid-cols-3 gap-2">
                                 <div className="bg-gray-900 p-2 rounded-lg text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Gross Fares</div>
                                    <div className="text-white font-bold">{earnings.today} <span className="text-amber-500 text-xs">؋</span></div>
                                 </div>
                                 <div className="bg-gray-900 p-2 rounded-lg text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Fee (10%)</div>
                                    <div className="text-red-400 font-bold">-{Math.round(earnings.today * 0.1)} <span className="text-amber-500 text-xs">؋</span></div>
                                 </div>
                                 <div className="bg-gray-900 p-2 rounded-lg text-center border border-amber-500/20">
                                    <div className="text-[10px] text-amber-500 uppercase">Net</div>
                                    <div className="text-green-400 font-bold">{Math.round(earnings.today * 0.9)} <span className="text-amber-500 text-xs">؋</span></div>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <div className="text-gray-500 text-xs mb-1">This Week</div>
                                 <div className="flex justify-between items-center bg-gray-900 p-2 rounded-lg">
                                    <span className="text-white font-bold text-sm">{Math.round(earnings.week * 0.9)} ؋</span>
                                    <span className="text-[10px] text-gray-500">NET (of {earnings.week})</span>
                                 </div>
                              </div>
                              <div>
                                 <div className="text-gray-500 text-xs mb-1">This Month</div>
                                 <div className="flex justify-between items-center bg-gray-900 p-2 rounded-lg">
                                    <span className="text-white font-bold text-sm">{Math.round(earnings.month * 0.9)} ؋</span>
                                    <span className="text-[10px] text-gray-500">NET (of {earnings.month})</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div className="bg-gray-800 border-t border-gray-700 p-2 flex justify-around text-xs font-bold text-gray-500 z-40 relative pb-safe">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex flex-col items-center w-full py-2 transition-colors ${currentTab === 'home' ? 'text-amber-500' : 'hover:text-gray-400'}`}
            >
              <Navigation size={22} className="mb-1" />
              <span>Drive</span>
            </button>
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex flex-col items-center w-full py-2 transition-colors ${currentTab === 'profile' ? 'text-amber-500' : 'hover:text-gray-400'}`}
            >
              <User size={22} className="mb-1" />
              <span>Profile</span>
            </button>
        </div>
      </div>
    </APIProvider>
  );
}
