# NutriScan - Smart Food Analysis & Nutrition Tracker

NutriScan is an AI-powered food analysis application that uses computer vision and machine learning to identify food items, provide detailed nutrition information, health insights, and find the best prices for your groceries.

## Features

### 🤖 AI-Powered Food Recognition
- **Google Vision API**: Advanced computer vision for accurate food identification
- **Multi-food Detection**: Recognizes multiple food items in a single image
- **Real-time Analysis**: Instant food recognition from photos

### 💡 Smart Health Insights
- **Google Gemini AI**: Personalized health recommendations and analysis
- **Health Score**: Get a health score from 1-100 for any meal
- **Custom Suggestions**: AI-powered recommendations to improve your nutrition

### 📊 Comprehensive Nutrition Data
- **USDA Database**: Access to the complete USDA FoodData Central database
- **Detailed Nutrients**: Complete breakdown of vitamins, minerals, and macronutrients
- **Calorie Tracking**: Accurate calorie information for all foods

### 📝 Food Diary & Dashboard
- **Log Meals**: Easily log breakfast, lunch, dinner, and snacks.
- **Daily Summary**: View your total caloric intake and meal history on the dashboard.
- **Clear History**: Option to clear the day's logged meals.

### ✍️ Educational Blog
- **Nutrition Science**: Learn about the latest in nutrition research
- **Food Technology**: Understand how AI and food recognition work
- **Healthy Living**: Tips and guides for better eating habits

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive styling
- **shadcn/ui**: Re-usable UI components
- **Lucide React**: Beautiful, consistent icons

### Backend & Database
- **Next.js API Routes**: Server-side API endpoints
- **Google Cloud Vision API**: Food recognition and image analysis
- **Google Gemini AI**: Natural language processing and health insights
- **better-sqlite3**: Local SQLite database for meal logging

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Google Cloud account with Vision API enabled
- Google AI Studio account for Gemini API

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd nutriscan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file by copying `.env.example` (if it exists) and add your API keys.
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   GCP_CREDENTIALS=your_gcp_credentials_json_string
   ```

4. **Initialize the database**
   The first time you run the app, navigate to `/api/init-db` in your browser to create the necessary database tables.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Scanning Food
1. Navigate to the "Scan" page
2. Take a photo or upload an image of your food
3. Wait for AI analysis (usually 2-5 seconds)
4. View detailed nutrition information and health insights
5. Log the meal to your Food Diary from the results page

### Dashboard
1. Visit the "Dashboard" to see your logged meals for the day.
2. Clear the daily log if needed.

## Deployment

This application uses a local SQLite database (`dev.db`), which is not suitable for serverless deployment platforms like Vercel or Netlify.

### For Local Deployment or a Single Server
1. Build the project:
   ```bash
   npm run build
   ```
2. Start the production server:
    ```bash
    npm start
    ```

### For Serverless Platforms (Vercel, Netlify, etc.)
Before deploying to a serverless platform, you **must** migrate the database from SQLite to a serverless-compatible database like **Vercel Postgres**, **Neon**, or **Supabase**.

1. **Create a new PostgreSQL database** on your chosen platform.
2. **Update the database connection logic** in `src/lib/db.ts` to use a PostgreSQL client (e.g., `pg` or `@vercel/postgres`).
3. **Add your database connection string** to your environment variables.
4. **Import your GitHub repository** to Vercel (or your chosen platform).
5. **Add environment variables** in the platform's dashboard.
6. **Deploy**.
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
nutriscan/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js 15 app directory
│   │   ├── api/        # API route handlers
│   │   ├── blog/       # Blog pages
│   │   ├── scan/       # Scan page
│   │   ├── about/      # About page
│   │   └── page.tsx    # Home page
│   ├── components/     # React components
│   │   ├── ui/         # UI components (buttons, cards, etc.)
│   │   └── ...         # Feature components
│   ├── lib/            # Utility functions
│   │   ├── api.ts      # API client functions
│   │   ├── demo-data.ts # Mock data for demo mode
│   │   └── utils.ts    # Utility functions
│   └── types/          # TypeScript type definitions
```

## Recent Updates

- Fixed hydration errors related to environment variables by implementing client-side detection
- Added new About page with detailed information about the application
- Improved responsive design for better mobile experience
- Enhanced error handling for API calls

## API Keys Configuration

For full functionality, this application requires the following API keys:

1. **Google Cloud Vision API** - For food recognition
2. **Google Gemini AI API** - For health insights
3. **USDA FoodData Central API** - For nutrition data

We've made it easy to set up your API keys:

1. First, configure your API keys in `.env.local` file (see [API-KEYS-SETUP.md](API-KEYS-SETUP.md) for detailed instructions)

2. Verify your API keys configuration:
   ```bash
   npm run verify-api-keys
   ```

3. Start the application with API keys check:
   ```bash
   npm run dev:with-api-check
   ```

The application includes a demo mode that activates automatically if API keys are not found, but for the best experience, we recommend configuring all APIs.

---

Made with ❤️ by the NutriScan team
