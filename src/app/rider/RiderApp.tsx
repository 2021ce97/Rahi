import React from "react";

export default function RiderApp() {
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <div className="bg-white p-4 shadow text-center font-bold text-lg border-b border-gray-200">
        Rahi - Rider Prototype
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-gray-500 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">Welcome to Rahi</h2>
          <p>The rider mobile experience goes here. Connects to backend APIs and Socket.IO for real-time negotiation.</p>
        </div>
      </div>
    </div>
  );
}
