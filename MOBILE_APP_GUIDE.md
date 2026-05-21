# React Native (Expo) Mobile App Guide

You are currently working in an AI Studio cloud environment. The web-based driver and rider apps in `src/app/driver` and `src/app/rider` are fully functional PWAs (Progressive Web Apps) that you can access from your mobile browser and "Add to Home Screen".

## 🚀 Building a Real Android App via your Expo Account

If you want a true `.apk` or `.aab` Android build installed on your phone via your Expo account (`fazl.sardar`), you can transition to Expo locally!

We have scaffolded an initial configuration for you in the `/expo-mobile` folder.

### Step 1: Export your project
1. In the AI Studio editor, click the **Settings** menu at the top.
2. Select **Download Zip** to save this entire codebase to your computer.

### Step 2: Run it locally
Once you have unzipped the project on your computer:
1. Open up your terminal (command prompt).
2. Change into the new mobile directory:
   ```bash
   cd your-project-folder/expo-mobile
   ```
3. Install the React Native / Expo dependencies:
   ```bash
   npm install
   ```
4. Start the Expo bundler:
   ```bash
   npx expo start
   ```

### Step 3: Test on your phone
1. Download the **Expo Go** application from the Google Play Store on your Android phone.
2. Scan the **QR Code** that appears in your terminal.
3. The native application will load!

### Step 4: Build your APK / App Bundle via EAS (Expo Application Services)
Because you have an Expo account (`fazl.sardar`):
1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login` (enter your credentials)
3. Configure the build: `eas build:configure`
4. Build the Android app: `eas build -p android --profile preview`

The `.apk` file will be generated in the cloud and you will receive a direct link to install it natively on your Android device!

### Bridging Web Socket to React Native
The scaffold uses the exact same `socket.io-client` we built for the web. Just ensure to replace the Socket URL in the React Native app from `window.location.host` to your actual deployed backend URL (e.g., `https://rahi-production.up.railway.app`).
