export const mockDrivers = [
  { id: "D-101", name: "Ahmad Noor", phone: "+93 79 123 4567", vehicle: "Toyota Corolla (White)", status: "online", lat: 34.5360, lng: 69.1760, rating: 4.8 },
  { id: "D-102", name: "Mahmoud S.", phone: "+93 70 987 6543", vehicle: "Toyota Fielder (Silver)", status: "in-ride", lat: 34.5240, lng: 69.1620, rating: 4.5 },
  { id: "D-103", name: "Zabiullah", phone: "+93 78 555 4444", vehicle: "Honda Civic (Grey)", status: "online", lat: 34.5160, lng: 69.1235, rating: 4.9 },
  { id: "D-104", name: "Sayed Ali", phone: "+93 77 111 2222", vehicle: "Toyota Corolla (Yellow)", status: "in-ride", lat: 34.5450, lng: 69.1760, rating: 4.2 },
  { id: "D-105", name: "Farhad Q.", phone: "+93 79 999 8888", vehicle: "Toyota Vitz (Blue)", status: "offline", lat: 34.5200, lng: 69.1500, rating: 4.7 },
];

export const mockRides = [
  { id: "R-9923", riderName: "Rahim H.", pickup: "PD6 Mosque", dropoff: "Kabul University", fare: 150, status: "In Progress", time: "2 min ago" },
  { id: "R-9922", riderName: "Obaid S.", pickup: "Shar-e-Naw Park", dropoff: "Wazir Akbar Khan", fare: 120, status: "Completed", time: "14 min ago" },
  { id: "R-9921", riderName: "Mustafa R.", pickup: "Kabul Airport", dropoff: "Macroyan 3", fare: 300, status: "Completed", time: "45 min ago" },
  { id: "R-9920", riderName: "Bismillah", pickup: "PD3 Market", dropoff: "Karte 4", fare: 100, status: "Cancelled", time: "1 hr ago" },
];

export const mockZones = [
  { id: "Z-01", name: "PD6 (Karte Seh)", type: "High Demand", baseMultiplier: 1.2, activeDrivers: 12, status: "Active" },
  { id: "Z-02", name: "Shar-e-Naw (PD10)", type: "Very High Demand", baseMultiplier: 1.5, activeDrivers: 24, status: "Active" },
  { id: "Z-03", name: "Wazir Akbar Khan", type: "Medium Demand", baseMultiplier: 1.1, activeDrivers: 8, status: "Active" },
  { id: "Z-04", name: "Macroyan (PD9)", type: "Normal", baseMultiplier: 1.0, activeDrivers: 15, status: "Active" },
];

export const mockDiasporaGifts = [
  { id: "G-8801", sender: "Mustafa K. (USA)", recipientPhone: "+93 70 123 4567", amountUSD: 25.00, amountAFN: 1750, status: "Redeemed", date: "2026-05-18" },
  { id: "G-8802", sender: "Ali S. (Germany)", recipientPhone: "+93 78 987 6543", amountUSD: 10.00, amountAFN: 700, status: "Pending", date: "2026-05-19" },
  { id: "G-8803", sender: "Zahra R. (Canada)", recipientPhone: "+93 79 555 1111", amountUSD: 50.00, amountAFN: 3500, status: "Partially Used", date: "2026-05-17" },
];

export const mockTransactions = [
  { id: "TX-1001", date: "2026-05-19 14:30", type: "Ride Fare", amount: 150, entity: "Driver D-101", status: "Completed" },
  { id: "TX-1002", date: "2026-05-19 14:15", type: "Commission", amount: -15, entity: "Platform", status: "Deducted" },
  { id: "TX-1003", date: "2026-05-19 13:45", type: "Ride Fare", amount: 120, entity: "Driver D-102", status: "Completed" },
  { id: "TX-1004", date: "2026-05-19 13:45", type: "Commission", amount: -12, entity: "Platform", status: "Deducted" },
  { id: "TX-1005", date: "2026-05-19 10:00", type: "Wallet Top-up", amount: 1000, entity: "Driver D-103", status: "Completed" },
  { id: "TX-1006", date: "2026-05-18 18:20", type: "Ride Fare", amount: 300, entity: "Driver D-104", status: "Completed" },
];

export const mockVerifications = [
  { id: "V-501", name: "Karim Ullah", phone: "+93 70 111 2233", status: "Pending", submittedAt: "10 mins ago" },
  { id: "V-502", name: "Dawoud Khan", phone: "+93 78 444 5566", status: "Pending", submittedAt: "1 hr ago" },
];

export const mockRiders = [
  { id: "U-2001", name: "Rahim H.", phone: "+93 79 555 1234", joinDate: "2025-10-12", totalRides: 42, rating: 4.8, status: "Active" },
  { id: "U-2002", name: "Obaid S.", phone: "+93 70 444 9876", joinDate: "2026-01-05", totalRides: 15, rating: 4.5, status: "Active" },
  { id: "U-2003", name: "Mustafa R.", phone: "+93 78 333 5555", joinDate: "2026-03-20", totalRides: 4, rating: 4.2, status: "Active" },
  { id: "U-2004", name: "Bismillah", phone: "+93 77 222 1111", joinDate: "2026-05-10", totalRides: 1, rating: 5.0, status: "Flagged" },
  { id: "U-2005", name: "Safi M.", phone: "+93 79 111 9999", joinDate: "2025-08-30", totalRides: 87, rating: 4.9, status: "Active" },
];
