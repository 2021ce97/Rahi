import { useState, useEffect } from "react";
import { Globe, ArrowRight, Smartphone, RefreshCw } from "lucide-react";

interface DiasporaGift {
  id: string;
  sender: string;
  recipientPhone: string;
  amountUSD: number;
  amountAFN: number;
  status: string;
  date: string;
}

export default function Diaspora() {
  const [gifts, setGifts] = useState<DiasporaGift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/diaspora")
      .then((res) => res.json())
      .then((data) => {
        setGifts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching diaspora gifts:", err);
        setLoading(false);
      });
  }, []);
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Diaspora Gift Rides (Stripe)</h1>
        <p className="text-sm text-gray-500">Monitor international payments used to fund wallets in Afghanistan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-xl text-white shadow-md">
           <h3 className="text-blue-100 text-sm font-medium mb-1">Total USD Processed</h3>
           <div className="text-3xl font-black mb-2">$4,250.00</div>
           <p className="text-xs text-blue-200">Via Stripe (Intl. Cards)</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-xl text-white shadow-md">
           <h3 className="text-teal-100 text-sm font-medium mb-1">Total AFN Distributed</h3>
           <div className="text-3xl font-black mb-2">297,500 AFN</div>
           <p className="text-xs text-teal-200">Exchange Rate: 70 AFN = 1 USD</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
           <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Pending Payouts</h3>
              <div className="text-2xl font-bold text-gray-900">$315.00</div>
           </div>
           <button className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full text-gray-600 transition-colors">
              <RefreshCw size={20} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
           <Globe size={18} className="text-blue-500" />
           <h2 className="font-bold text-gray-700">Recent Gift Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Txn ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Sender (Stripe)</th>
                <th className="px-6 py-4 font-medium text-center">Flow</th>
                <th className="px-6 py-4 font-medium">Recipient Wallet (AF)</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 animate-pulse">
                    Loading diaspora gifts...
                  </td>
                </tr>
              ) : gifts.map((gift) => (
                <tr key={gift.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{gift.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{gift.date}</td>
                  <td className="px-6 py-4">
                     <div className="font-medium text-gray-900">{gift.sender}</div>
                     <div className="font-bold text-blue-600 text-sm">${gift.amountUSD.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <ArrowRight size={20} className="text-gray-300 mx-auto" />
                     <div className="text-[10px] text-gray-400 font-medium">CONVERT</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-900 text-sm">{gift.recipientPhone}</span>
                     </div>
                     <div className="font-bold text-emerald-600 text-sm mt-0.5">{gift.amountAFN} AFN</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        gift.status === 'Redeemed' ? 'bg-green-100 text-green-700' :
                        gift.status === 'Pending' ? 'bg-teal-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                     }`}>
                       {gift.status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
