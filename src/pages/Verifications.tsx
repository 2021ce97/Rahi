import { useState, useEffect } from "react";
import { Upload, CheckCircle, XCircle, FileText, CheckSquare, Square } from "lucide-react";

interface Verification {
  id: string;
  name: string;
  phone: string;
  status: string;
  submittedAt: string;
}

export default function Verifications() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/verifications")
      .then((res) => res.json())
      .then((data) => {
        setVerifications(data);
        if (data.length > 0) setSelectedId(data[0].id);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching verifications:", err);
        setLoading(false);
      });
  }, []);
  
  const selectedRecord = verifications.find(v => v.id === selectedId);

  return (
    <div className="space-y-6 pb-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Verifications</h1>
        <p className="text-sm text-gray-500">Tazkira and driver document reviews.</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar List */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-100 font-medium text-gray-700">
            Pending Queue ({verifications.length})
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm animate-pulse">Loading documents...</div>
            ) : verifications.map(v => (
              <button 
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedId === v.id 
                    ? "bg-teal-50 border-amber-200" 
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900">{v.name}</span>
                  <span className="text-xs bg-teal-100 text-amber-700 px-2 py-0.5 rounded-full">{v.status}</span>
                </div>
                <div className="text-sm text-gray-500">{v.id} • {v.phone}</div>
                <div className="text-xs text-gray-400 mt-2">Submitted: {v.submittedAt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Verification Details */}
        <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {selectedRecord ? (
            <>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-gray-400" /> Reviewing: {selectedRecord.name}
                </h2>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Driver Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-3"><span className="text-gray-500">Full Name</span> <span className="col-span-2 font-medium">{selectedRecord.name}</span></div>
                      <div className="grid grid-cols-3"><span className="text-gray-500">Phone</span> <span className="col-span-2 font-medium">{selectedRecord.phone}</span></div>
                      <div className="grid grid-cols-3"><span className="text-gray-500">Applied Role</span> <span className="col-span-2 font-medium">Standard Driver</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Extracted Data (OCR)</h3>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-3"><span className="text-gray-500">Tazkira ID</span> <span className="col-span-2 font-mono bg-gray-100 px-1 rounded">142-9988-77</span></div>
                      <div className="grid grid-cols-3"><span className="text-gray-500">Birth Year</span> <span className="col-span-2 font-medium">1372 (1993)</span></div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Document Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg h-48 bg-gray-50 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-50/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <SearchIcon className="mb-2" />
                         <span>View Full Size</span>
                      </div>
                      <FileText size={48} className="text-gray-300 mb-2" />
                      <span className="text-sm">Tazkira Front (Mock Image)</span>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg h-48 bg-gray-50 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                        <span className="text-sm block mb-2">Driver Profile Photo</span>
                        <button className="text-xs text-teal-600 font-medium">Upload override</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                   <CheckSquare className="text-teal-600 shrink-0 mt-0.5" />
                   <div>
                     <span className="font-bold text-gray-900 block text-sm">Automated Checks</span>
                     <span className="text-xs text-gray-500 block mt-1">Facial match: 92% | Document expiry: Valid | Watchlist: Clear</span>
                   </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                <button className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                  <XCircle size={16} /> Reject
                </button>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                  <CheckCircle size={16} /> Approve & Activate
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a verification request to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}
