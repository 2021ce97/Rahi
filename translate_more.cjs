const fs = require('fs');

const dtranslations = {
  '>Driver Portal<': '>اپلیکیشن راننده / د موټر چلوونکي اپلیکیشن (Driver Portal)<',
  'Waiting for requests': 'در انتظار درخواست / د غوښتنو په تمه (Waiting...)',
  'New Ride Request': 'درخواست جدید / نوې غوښتنه (New Request)',
  'Profile Settings': 'تنظیمات حساب / د حساب تنظیمات (Settings)',
  'Total Earnings': 'مجموع درآمد / ټول عاید (Total Earnings)',
  'Accept Request': 'قبول درخواست / غوښتنه منل (Accept)',
  'Decline': 'رد کردن / ردول (Decline)'
};

const file = 'src/app/driver/DriverApp.tsx';
let content = fs.readFileSync(file, 'utf8');
for (const [eng, local] of Object.entries(dtranslations)) {
  content = content.replaceAll(eng, local);
}
fs.writeFileSync(file, content);
