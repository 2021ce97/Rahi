const fs = require('fs');
const files = ['src/app/rider/RiderApp.tsx', 'src/app/driver/DriverApp.tsx', 'src/app/driver/components/RideRequestCard.tsx'];

const translations = {
  '>Rider App<': '>اپلیکیشن مسافر / د مسافر اپلیکیشن (Rider App)<',
  'Pickup Location': 'مکان مبدا / د پورته کیدو ځای (Pickup)',
  'Dropoff Location': 'مقصد / د کوزیدو ځای (Dropoff)',
  'Your Offer (AFN)': 'پیشنهاد شما افغانی / ستا وړاندیز (Offer AFN)',
  '>Request Ride<': '>درخواست سفر / موټر غوښتل (Request Ride)<',
  'Finding Drivers...': 'در حال جستجوی راننده / موټر چلوونکی لټول (Finding Drivers...)',
  '>Cancel Request<': '>لغو درخواست / غوښتنه لغوه کول (Cancel)<',
  'Live Driver Bids': 'پیشنهادهای رانندگان / د موټر چلوونکو وړاندیزونه (Bids)',
  'Ride Tracking': 'ردیابی سفر / د سفر تعقیب (Ride Tracking)',
  'Contact Driver': 'تماس با راننده / موټر چلوونکي سره اړیکه (Contact)',
  '>Cancel Ride<': '>لغو سفر / سفر لغوه کول (Cancel)<',
  '>Driver Portal<': '>اپلیکیشن راننده / د چلوونکي اپلیکیشن (Driver Portal)<',
  'Waiting for requests': 'در انتظار درخواست / د غوښتنو په تمه (Waiting...)',
  'Counter Offer': 'پیشنهاد متقابل / متقابل وړاندیز (Counter Offer)',
  'Counter-offer (AFN)': 'پیشنهاد متقابل (افغانی) / متقابل وړاندیز',
  ">Submit Bid<": ">ارسال پیشنهاد / وړاندیز لیږل (Submit Bid)<",
  ">I'm Arrived<": ">راننده رسید / موټر چلوونکی ورسید (Arrived)<",
  ">Start Ride<": ">شروع سفر / سفر پیل کول (Start Ride)<",
  ">Finish Ride<": ">پایان سفر / سفر پای ته رسول (Finish Ride)<",
  "Today's Earnings": "درآمد امروز / د نن ورځې عاید (Today Earnings)",
  "Vehicle Details": "مشخصات موټر / د موټر معلومات (Vehicle Details)"
};

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [eng, local] of Object.entries(translations)) {
      content = content.replaceAll(eng, local);
    }
    fs.writeFileSync(file, content);
  }
});
