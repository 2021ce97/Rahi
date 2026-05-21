import React, { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Compass, MapPin, Navigation, DollarSign, Car, Star, CheckCircle, Clock, History, Home, XCircle, Mic, AlertTriangle, Info, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapDirections } from '../components/MapDirections';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function useRideNegotiation(socket: Socket | null) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [bids, setBids] = useState<any[]>([]);
  const [acceptedBid, setAcceptedBid] = useState<any | null>(null);
  const [rideStatus, setRideStatus] = useState<string>("Finding Driver"); // En route to pickup, Arrived at pickup, In ride, End ride
  
  const requestRide = useCallback((pickup: string, dropoff: string, offer: string) => {
    if (!pickup || !dropoff || !offer) return;
    setIsRequesting(true);
    setBids([]);
    setAcceptedBid(null);
    socket?.emit("request_ride", {
      pickup,
      dropoff,
      offer: parseInt(offer, 10)
    });
  }, [socket]);

  const acceptBid = useCallback((bid: any) => {
    setAcceptedBid(bid);
    setRideStatus("En route to pickup");
    socket?.emit("accept_bid", { ...bid, riderSocketId: socket?.id });
    setIsRequesting(false);
  }, [socket]);

  const cancelRequest = useCallback(() => {
    setIsRequesting(false);
    setBids([]);
  }, []);

  const resetRide = useCallback(() => {
    setAcceptedBid(null);
    setRideStatus("Finding Driver");
    setIsRequesting(false);
    setBids([]);
  }, []);

  return {
    isRequesting,
    bids,
    setBids,
    acceptedBid,
    setAcceptedBid,
    rideStatus,
    setRideStatus,
    requestRide,
    acceptBid,
    cancelRequest,
    resetRide
  };
}

export default function RiderApp() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'history'>('home');
  const [pickup, setPickup] = useState("Kabul University");
  const [dropoff, setDropoff] = useState("Shahr-e-Naw");
  const [offer, setOffer] = useState("150");
  const [selectedTier, setSelectedTier] = useState("Economy");
  
  const {
    isRequesting,
    bids,
    setBids,
    acceptedBid,
    setAcceptedBid,
    rideStatus,
    setRideStatus,
    requestRide,
    acceptBid,
    cancelRequest,
    resetRide
  } = useRideNegotiation(socket);

  // Tracking details
  const [driverLocation, setDriverLocation] = useState({lat: 34.5281, lng: 69.1723});
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [liveETA, setLiveETA] = useState<string>("");
  
  // History & Cancel
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchHistory = () => {
    fetch('/api/rider/history').then(res => res.json()).then(data => setRideHistory(data));
  };

  useEffect(() => {
    // Load state from local storage on mount
    const savedState = localStorage.getItem('rider_app_state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.acceptedBid) {
          setAcceptedBid(state.acceptedBid);
          setRideStatus(state.rideStatus || "En route to pickup");
          setPickup(state.pickup || "Kabul University");
          setDropoff(state.dropoff || "Shahr-e-Naw");
          setBids([]);
        }
      } catch (e) {
        console.error("Failed to restore rider state", e);
      }
    }

    // Connect to Socket.io
    const newSocket = io(window.location.host); // Adjust to the current host
    setSocket(newSocket);

    newSocket.on("bid_received", (bid: any) => {
      setBids((prev) => [...prev, bid]);
    });

    newSocket.on("driver_location_update", (payload) => {
      setDriverLocation({ lat: payload.lat, lng: payload.lng });
    });

    newSocket.on("ride_status_update", (payload) => {
      setRideStatus(payload.status);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('HamRah Ride Update', { body: `Driver is now: ${payload.status}` });
      }

      if (payload.status === "End ride") {
        setTimeout(() => {
          resetRide();
          setChatMessages([]);
          setLiveETA("");
        }, 5000);
      }
    });

    newSocket.on("ride_cancelled", () => {
       alert("The driver cancelled the ride.");
       resetRide();
       setChatMessages([]);
       setLiveETA("");
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
    if (acceptedBid) {
      localStorage.setItem('rider_app_state', JSON.stringify({
        acceptedBid,
        rideStatus,
        pickup,
        dropoff
      }));
    } else {
      localStorage.removeItem('rider_app_state');
    }
  }, [acceptedBid, rideStatus, pickup, dropoff]);

  const handleRequestRide = () => {
    requestRide(pickup, dropoff, offer);
  };

  const handleAcceptBid = (bid: any) => {
    acceptBid(bid);
  };

  const triggerSOS = () => {
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
  
  const sendChatMessage = () => {
    if (!newMessage.trim() || !socket || !acceptedBid) return;
    socket.emit("chat_message", {
      targetSocketId: acceptedBid.driverSocketId,
      sender: "Rider",
      message: newMessage
    });
    setChatMessages(prev => [...prev, { sender: "You", text: newMessage }]);
    setNewMessage("");
  };

  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center p-6 h-screen font-sans bg-gray-50 flex-col">
        <div className="text-center max-w-md bg-white p-6 rounded-xl shadow-lg border border-red-100">
          <h2 className="text-xl font-bold text-red-600 mb-4">Google Maps API Key Required</h2>
          <p className="mb-4 text-slate-700 text-sm"><strong>Step 1:</strong> <a className="text-blue-500 underline" href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener">Get an API Key</a></p>
          <p className="mb-4 text-slate-700 text-sm"><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul className="text-left text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code className="bg-gray-100 px-1 rounded text-pink-600">GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p className="mt-4 text-gray-500 text-xs text-left">The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="flex flex-col h-screen max-w-md mx-auto bg-white border-x border-gray-200 font-sans shadow-xl relative overflow-hidden">
        
        {/* Background Map */}
        <div className="absolute inset-0 z-0">
          <Map
            defaultCenter={{lat: 34.5281, lng: 69.1723}} // Kabul
            center={driverLocation}
            defaultZoom={13}
            mapId="RIDER_DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{width: '100%', height: '100%'}}
            disableDefaultUI={true}
          >
            {rideStatus !== "Finding Driver" && (
              <AdvancedMarker position={driverLocation}>
                <div className="bg-teal-500 rounded-full w-4 h-4 shadow-lg border-2 border-white"></div>
              </AdvancedMarker>
            )}
            {acceptedBid ? (
              <MapDirections origin={pickup} destination={dropoff} onETACalculated={(t) => setLiveETA(t)} />
            ) : (
              <AdvancedMarker position={{lat: 34.5281, lng: 69.1723}}>
                <Pin background="#f59e0b" glyphColor="#fff" borderColor="#b45309" />
              </AdvancedMarker>
            )}
          </Map>
        </div>

        {/* Foreground UI overlay */}
        <div className="bg-teal-500 p-4 shadow-sm flex items-center justify-center font-bold text-white text-lg z-10 relative mt-0 safe-top">
          <Compass className="mr-2" size={24} />
          HamRah Rider
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end gap-4 z-10 pointer-events-none pb-[20px] pt-4">
          <div className="pointer-events-auto">
        {acceptedBid ? (
          <div className="flex flex-col bg-white rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border border-gray-200 mt-auto overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800">{rideStatus}</h2>
                   <p className="text-gray-500 text-sm">
                     {rideStatus === "Finding Driver" ? "Searching..." : 
                      rideStatus === "En route to pickup" ? `Arriving in ~${liveETA || acceptedBid.eta}` :
                      rideStatus === "In ride" ? `Dropoff in ~${liveETA || "calculating..."}` :
                      "..."}
                   </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-500 overflow-hidden shadow-inner">
                  <div className="animate-pulse">
                    <Car size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center mb-4">
                 <div>
                    <h3 className="font-bold text-lg">{acceptedBid.driverName}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star size={14} className="text-teal-400 mr-1 fill-current" /> {acceptedBid.rating} • {acceptedBid.vehicle}
                    </div>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-xl text-teal-600">{acceptedBid.fareAmount} ؋</div>
                   <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Fare</div>
                 </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-white border-t border-gray-100 max-h-[160px]">
              <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 flex justify-between items-center">
                <span>Chat with Driver</span>
                {rideStatus !== "End ride" && (
                  <button onClick={() => setShowCancelModal(true)} className="text-red-500 hover:text-red-600 underline">لغو سفر / سفر لغوه کول (Cancel)</button>
                )}
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-2">
                 {chatMessages.length === 0 && <div className="text-gray-400 text-xs text-center mt-2">No messages yet.</div>}
                 {chatMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.sender === 'You' ? 'bg-teal-500 text-white rounded-br-none' : 'bg-gray-100 text-slate-800 rounded-bl-none'}`}>
                        {msg.text}
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                 <input 
                    type="text" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Message driver..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                 />
                 <button onClick={sendChatMessage} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">Send</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Ride Request Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4 relative z-10">
              <div className="relative">
                <div className="absolute left-3 top-3 text-blue-500">
                  <Navigation size={18} />
                </div>
                <input
                  type="text"
                  placeholder="مکان مبدا / د پورته کیدو ځای (Pickup)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  disabled={isRequesting}
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-3 text-red-500">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  placeholder="مقصد / د کوزیدو ځای (Dropoff)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  disabled={isRequesting}
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-3 text-green-600">
                  <DollarSign size={18} />
                </div>
                <input
                  type="number"
                  placeholder="Offer Fare (AFN)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  disabled={isRequesting}
                />
              </div>

              {!isRequesting && (
                <button
                  onClick={handleRequestRide}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
                >
                  Request Ride
                </button>
              )}
            </div>

            {/* Bids Section */}
            {isRequesting && (
              <div className="flex-1 flex flex-col pt-2">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-slate-700">Driver Offers</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Negotiating...
                  </div>
                </div>

                {bids.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10 space-y-4">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-teal-500 rounded-full animate-spin"></div>
                    <p>Finding drivers nearby...</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-6">
                    <AnimatePresence>
                      {bids.map((bid) => (
                        <motion.div
                          key={bid.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-4 rounded-xl shadow-sm border border-teal-100 flex flex-col"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-bold text-slate-800">{bid.driverName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Star size={12} className="text-teal-500 mr-1 fill-current" />
                                {bid.rating} • {bid.vehicle}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-teal-600">{bid.fareAmount} ؋</div>
                              <div className="text-xs text-gray-400">{bid.eta} away</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 uppercase text-xs font-bold tracking-wider">
                            <button
                              onClick={() => handleAcceptBid(bid)}
                              className="flex-1 bg-teal-500 text-white rounded-md py-2 hover:bg-teal-600 transition-colors"
                            >
                              Accept Offer
                            </button>
                            <button
                              onClick={() => setBids(bids.filter(b => b.id !== bid.id))}
                              className="bg-gray-100 text-gray-600 px-4 rounded-md py-2 hover:bg-gray-200 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    cancelRequest();
                  }}
                  className="mt-4 text-gray-500 font-medium py-2 hover:text-slate-800 transition-colors"
                >
                  Cancel Request
                </button>
              </div>
            )}
          </>
        )}
          </div>
        </div>

        {/* Cancel Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col"
              >
                <div className="flex items-center text-red-500 mb-4">
                  <XCircle size={28} className="mr-2" />
                  <h3 className="text-xl font-bold">Cancel Ride?</h3>
                </div>
                <p className="text-gray-600 mb-4">Please select a reason for cancelling this ride.</p>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-6"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Taking too long">Driver is taking too long</option>
                  <option value="Changed mind">I changed my mind</option>
                  <option value="Wrong location">I entered the wrong address</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex gap-3">
                  <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-slate-700 rounded-lg font-bold">Nevermind</button>
                  <button
                    disabled={!cancelReason}
                    onClick={() => {
                        socket?.emit("cancel_ride", { role: "Rider", reason: cancelReason, targetSocketId: acceptedBid?.driverSocketId });
                        resetRide();
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

        {/* History View Overlay */}
        {currentTab === 'history' && (
          <div className="absolute inset-0 z-30 bg-gray-50 pt-[60px] pb-[70px] overflow-y-auto">
             <div className="p-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Ride History</h2>
                <div className="space-y-4">
                  {rideHistory.map(ride => (
                     <div key={ride.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                           <div className="font-bold text-slate-800">{ride.date}</div>
                           <div className={`px-2 py-1 rounded text-xs font-bold ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {ride.status.toUpperCase()}
                           </div>
                        </div>
                        <div className="space-y-2 mt-3">
                           <div className="flex items-center text-sm"><Navigation size={14} className="text-blue-500 mr-2" />{ride.pickup}</div>
                           <div className="flex items-center text-sm"><MapPin size={14} className="text-red-500 mr-2" />{ride.dropoff}</div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                           <div className="text-sm text-gray-500">Driver: {ride.driver}</div>
                           <div className="font-bold">{ride.fare} ؋</div>
                        </div>
                     </div>
                  ))}
                  {rideHistory.length === 0 && <p className="text-gray-500 text-center py-10">No rides found.</p>}
                </div>
             </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div className="bg-white border-t border-gray-200 p-2 flex justify-around text-xs font-bold text-gray-400 z-40 relative pb-safe">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex flex-col items-center w-full py-2 transition-colors ${currentTab === 'home' ? 'text-teal-500' : 'hover:text-gray-600'}`}
            >
              <Home size={22} className="mb-1" />
              <span>خانه / کور (Home)</span>
            </button>
            <button
              onClick={() => { setCurrentTab('history'); fetchHistory(); }}
              className={`flex flex-col items-center w-full py-2 transition-colors ${currentTab === 'history' ? 'text-teal-500' : 'hover:text-gray-600'}`}
            >
              <History size={22} className="mb-1" />
              <span>تاریخچه / تاریخ (History)</span>
            </button>
        </div>
      </div>
    </APIProvider>
  );
}

