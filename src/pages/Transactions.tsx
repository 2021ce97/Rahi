import { useState, useEffect } from "react";
import { Download, Filter } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  entity: string;
  status: string;
}

export default function Transactions() {
  const [filterType, setFilterType] = useState("All");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);
        setLoading(false);
      });
  }, []);

  const filteredTxs = filterType === "All" 
    ? transactions 
    : transactions.filter(tx => tx.type === filterType);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Transactions</h1>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue (Today)</p>
          <h3 className="text-xl font-bold text-gray-900">12,450 AFN</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Platform Commission</p>
          <h3 className="text-xl font-bold text-amber-600">1,245 AFN</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Payouts</p>
          <h3 className="text-xl font-bold text-gray-900">4,500 AFN</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          {["All", "Ride Fare", "Commission", "Wallet Top-up"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filterType === type 
                  ? "bg-amber-100 text-amber-700 font-medium" 
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
          <div className="flex-1"></div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            More Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Txn ID</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Entity</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Amount (AFN)</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 animate-pulse">
                    Loading financial records...
                  </td>
                </tr>
              ) : filteredTxs.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tx.entity}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{tx.type}</span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      {tx.status}
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
