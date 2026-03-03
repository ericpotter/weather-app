# Weather App

A React Native weather application built with Expo. Search any location or use your current GPS position to get real-time weather conditions, a 5-day forecast, and a Wikipedia summary of the location. Search history is persisted in Firebase Firestore with full CRUD support and JSON export.

## Features

- Location search by city, town, or landmark
- Current location detection via device GPS
- Real-time weather data (temperature, humidity, wind speed, condition)
- 5-day forecast
- Wikipedia summary for searched locations
- Search history stored in Firebase Firestore
- Add and edit notes on saved weather records
- Export history as JSON via native share sheet

## Prerequisites

- Node.js and npm
- Expo Go app on a physical device, or an iOS/Android simulator
- A Firebase project with Firestore enabled (required for history/CRUD features)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure Firebase by setting the following environment variables (prefix required by Expo):

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

You can place these in a `.env` file at the project root. Without them, the app runs but all Firestore operations will fail.

3. Start the development server:

```bash
npm start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

## Tech Stack

- React Native (Expo)
- TypeScript
- Firebase Firestore
- Open-Meteo API (no API key required)
- Wikipedia REST API
