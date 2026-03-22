# IT Services Chat Bot with Claude AI

A modern chat bot for IT services built with React, TypeScript, and powered by Anthropic's Claude AI.

## Features

- 🤖 **Claude AI Integration** - Powered by Anthropic's Claude 3 Sonnet model
- 💬 **Interactive Chat Interface** - Clean, professional UI with message history
- 🔘 **Smart Button Responses** - Contextual quick-reply buttons
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Real-time Responses** - Live typing indicators and smooth animations

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies
```bash
npm install
```

3. **Set up Claude API Key**

   a. Visit [Anthropic Console](https://console.anthropic.com/)

   b. Sign up for an account (if you don't have one)

   c. Navigate to API Keys section

   d. Create a new API key

   e. Copy the API key and update the `.env` file:
   ```env
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
   ```

   ⚠️ **Important**: Never commit your real API key to version control. The `.env` file is already in `.gitignore`.

   ✅ **Security**: API calls are now handled securely through the backend server.

4. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## API Configuration

The bot uses Claude 3 Sonnet with a specialized system prompt for IT services. It can handle:

- Technical support queries
- Service requests
- FAQ responses
- Pre-sales consulting
- General IT assistance

## Security Note

⚠️ **Production Deployment**: The current setup makes API calls directly from the browser. For production, consider moving API calls to a backend server to protect your API key.

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **AI**: Anthropic Claude API
- **Build Tool**: Vite
- **Icons**: Lucide React
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bbb39b31-7399-41aa-b826-4dd20be8328a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
