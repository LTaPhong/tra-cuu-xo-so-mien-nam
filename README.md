# Lottery Result Checking Application

This application allows users to check lottery results using a React frontend and a Node.js backend. The frontend is hosted on GitHub Pages, and the backend is deployed on Render.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in a `.env` file to your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy Backend to Render

1. Create a new service on Render and connect it to your GitHub repository.
2. Set the environment variable `GEMINI_API_KEY` in the Render dashboard.
3. Deploy the backend by selecting the `ocr-backend.js` file as the entry point.
4. Configure CORS to allow requests only from your GitHub Pages domain (e.g., `https://ltaphong.github.io`).

## Deploy Frontend to GitHub Pages

1. Update the `homepage` field in `package.json` to your GitHub Pages URL:
   ```json
   "homepage": "https://<your-username>.github.io/<repository-name>/"
   ```
2. Build the frontend:
   ```bash
   npm run build
   ```
3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```
4. Ensure GitHub Pages is enabled for the `gh-pages` branch in your repository settings.

## Usage Instructions

1. Open the deployed frontend URL in your browser.
2. Enter the lottery details in the form and submit.
3. View the results displayed on the page.

## Troubleshooting

- **404 Errors on GitHub Pages:** Ensure the `homepage` field in `package.json` is correctly set.
- **CORS Issues:** Verify that the backend CORS configuration allows requests from your GitHub Pages domain.
- **Environment Variables Not Found:** Ensure the `.env` file is correctly set up locally and the `GEMINI_API_KEY` is configured in Render.
