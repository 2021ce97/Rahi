import React from "react";

export default function DriverApp() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <div className="bg-gray-800 p-4 shadow-sm text-center font-bold text-lg border-b border-gray-700">
        Rahi - Driver Prototype
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-gray-400 text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">Driver Portal</h2>
          <p>The driver mobile experience goes here. View incoming requests, bid on rides via WebSockets.</p>
        </div>
      </div>
    </div>
  );
}
