const fs = require('fs');
let content = fs.readFileSync('src/app/rider/RiderApp.tsx', 'utf8');
content = content.replaceAll('>History<', '>تاریخچه / تاریخ (History)<');
content = content.replaceAll('>Home<', '>خانه / کور (Home)<');
fs.writeFileSync('src/app/rider/RiderApp.tsx', content);

let dcontent = fs.readFileSync('src/app/driver/DriverApp.tsx', 'utf8');
dcontent = dcontent.replaceAll('>History<', '>تاریخچه / تاریخ (History)<');
dcontent = dcontent.replaceAll('>Home<', '>خانه / کور (Home)<');
fs.writeFileSync('src/app/driver/DriverApp.tsx', dcontent);
