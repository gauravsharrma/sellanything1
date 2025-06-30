# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. Ensure your Firebase project allows read/write access for the Firestore collections used in this demo. If you see "Missing or insufficient permissions" errors, update your Firestore security rules accordingly or use the Firestore emulator.
