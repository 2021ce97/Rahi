import React, { useState, useEffect } from "react";
import { MessageSquare, AlertCircle, CheckCircle, Search, Filter } from "lucide-react";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  reporterId: string;
  reportedEntityId: string;
  createdAt: string;
  resolutionNotes?: string;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    fetch("/api/tickets")
      .then(r => r.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionNotes: resolution })
      });
      if (res.ok) {
        setTickets(tickets.map(t => t._id === id ? { ...t, status: "resolved", resolutionNotes: resolution } : t));
        setResolution("");
        setExpandedId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-teal-500" />
            Support & Feedback
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage rider reviews, resolve driver disputes, and handle user reports.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tickets by ID or title..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filter by Status
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Ticket ID / Reporter</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                       <MessageSquare className="animate-bounce text-gray-300 mb-2" size={24} />
                       Loading support tickets...
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No support tickets found.
                  </td>
                </tr>
              ) : tickets.map((t) => (
                <React.Fragment key={t._id}>
                  <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === t._id ? null : t._id)}>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-500">{t._id.slice(-6).toUpperCase()}</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{t.reporterId || "Unknown"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold capitalize">
                        {t.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        t.status === 'open' ? 'bg-teal-50 text-amber-700 border-amber-200' :
                        t.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {t.status === 'resolved' && <CheckCircle size={14} />}
                        {t.status === 'open' && <AlertCircle size={14} />}
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-teal-600 hover:text-amber-800 text-sm font-medium transition-colors">
                         Review
                       </button>
                    </td>
                  </tr>
                  
                  {expandedId === t._id && (
                    <tr className="bg-teal-50/30">
                       <td colSpan={6} className="px-10 py-6 border-b border-t border-teal-100/50 shadow-inner">
                          <h4 className="font-bold text-gray-900 mb-2">{t.title}</h4>
                          <p className="text-gray-700 text-sm mb-4 leading-relaxed">{t.description}</p>
                          
                          {t.status !== 'resolved' ? (
                             <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm max-w-3xl">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resolve Ticket</label>
                                <textarea 
                                  value={resolution}
                                  onChange={(e) => setResolution(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 mb-3 resize-none"
                                  placeholder="Enter resolution notes..."
                                  rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setExpandedId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">Cancel</button>
                                  <button onClick={() => handleResolve(t._id)} disabled={!resolution} className="px-4 py-2 bg-teal-500 text-white rounded text-sm font-bold hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed hidden md:block">Mark as Resolved</button>
                                </div>
                             </div>
                          ) : (
                             <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm max-w-3xl">
                                <strong className="text-green-800 block mb-1 flex items-center gap-2"><CheckCircle size={16} /> Resolution Notes</strong>
                                <p className="text-green-900">{t.resolutionNotes}</p>
                             </div>
                          )}
                       </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
