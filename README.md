# 🚀 AI Code Platform

An AI-powered application builder that generates complete, working web applications from natural language descriptions. Built with Next.js, OpenAI, and Sandpack for live in-browser preview.

## ✨ Features

- **Natural Language Input**: Describe your app in plain English
- **Intelligent Blueprint Generation**: AI creates a detailed implementation plan
- **Real-time File Generation**: Watch as files are created one by one
- **Live Preview**: See your app running instantly in an in-browser sandbox
- **Code Viewing**: Browse and inspect all generated files with Monaco Editor
- **Session Persistence**: Your work is automatically saved to localStorage
- **Beautiful UI**: Modern, responsive design with dark mode support

## 🏗️ Architecture

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS
- **AI**: OpenAI API (GPT-4o-mini or GPT-5-nano)
- **Code Editor**: Monaco Editor
- **Live Preview**: Sandpack (CodeSandbox)
- **Validation**: Zod schemas
- **Notifications**: Sonner
- **Deployment**: Vercel (serverless)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd lovable10
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

To get an OpenAI API key:
- Visit [platform.openai.com](https://platform.openai.com)
- Sign up or log in
- Go to API Keys section
- Create a new secret key

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

1. **Describe your app** in the input field. Examples:
   - "Create a todo list app with dark mode"
   - "Build a weather dashboard with search"
   - "Make a simple calculator with a modern UI"

2. **Watch the magic happen**:
   - Blueprint appears first with the implementation plan
   - Files are generated one by one
   - Live preview updates automatically

3. **Explore the code**:
   - Click files in the tree to view their contents
   - Use Monaco editor to inspect the code
   - Toggle console in preview to debug

4. **Refine and iterate**:
   - Enter new prompts to modify your app
   - Previous session is saved automatically

## 📁 Project Structure

```
lovable10/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # Streaming API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── components/
│   ├── BlueprintView.tsx         # Blueprint display
│   ├── ChatInput.tsx             # Prompt input
│   ├── CodeViewer.tsx            # Monaco editor wrapper
│   ├── FileTree.tsx              # File navigation
│   └── PreviewPanel.tsx          # Sandpack preview
├── lib/
│   ├── openai.ts                 # OpenAI client wrapper
│   ├── sandpackAdapter.ts        # Sandpack file transformer
│   ├── schemas.ts                # Zod validation schemas
│   └── storage.ts                # localStorage utilities
├── .env.example                  # Environment variables template
├── .env.local                    # Your environment variables (create this)
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🔧 API Reference

### POST `/api/generate`

Generates a new application or refines an existing one.

**Request Body:**
```json
{
  "prompt": "Create a todo list app",
  "intent": "new",
  "targetFile": "App.js",
  "model": "gpt-4o-mini"
}
```

**Response:** NDJSON stream of messages:
- `status`: Progress updates
- `blueprint`: Implementation plan
- `file`: Generated file
- `file_update`: File modification
- `complete`: Generation finished
- `error`: Error message

## 🌐 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables:
     - `OPENAI_API_KEY`
     - `OPENAI_MODEL`

3. **Deploy**: Vercel will automatically build and deploy

### Deploy to Other Platforms

The app can run on any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Azure Static Web Apps

## 🎨 Customization

### Change AI Model

Edit `.env.local`:
```bash
OPENAI_MODEL=gpt-4o
# or
OPENAI_MODEL=gpt-5-nano
```

### Modify System Prompt

Edit the `SYSTEM_PROMPT` in `app/api/generate/route.ts` to change how the AI generates code.

### Customize UI Theme

Edit `tailwind.config.ts` to change colors, fonts, and animations.

## 🐛 Troubleshooting

### "OpenAI API key not configured"
- Check that `.env.local` exists and contains `OPENAI_API_KEY`
- Restart the dev server after adding environment variables

### Files not appearing in preview
- Ensure the AI generated all required files (index.html, index.js, App.js)
- Check browser console for errors
- Try regenerating with a simpler prompt

### Preview not loading
- Check that Sandpack dependencies are installed
- Clear browser cache
- Verify files have valid syntax

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [OpenAI](https://openai.com) - AI models
- [Sandpack](https://sandpack.codesandbox.io) - In-browser code execution
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Tailwind CSS](https://tailwindcss.com) - Styling

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions

---

**Built with ❤️ using AI**
