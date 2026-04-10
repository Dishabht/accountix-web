<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Set `VITE_PORT` in `.env.local` (default: `5173`)
4. Run the app:
   `npm run dev`

## Port behavior

- `npm run dev` uses the configured app port.
- Default port: `5173`.
- To change it, set `VITE_PORT=<your_port>` in `.env.local`.
