# CareerBoost AI

AI-powered job matching, cover letter writing, and resume optimization app built with React, TypeScript, and Google's Gemini AI.

## Features

- 🎯 **Smart Job Matching** - AI analyzes your CV against job descriptions
- 📝 **Cover Letter Generation** - Creates personalized cover letters
- 🔧 **Resume Optimization** - ATS-friendly resume tailoring
- 💬 **AI Career Advisor** - Interactive chat for job application guidance
- 📄 **Export Options** - Download as PDF or DOCX

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/careerboost-ai.git
   cd careerboost-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get your Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Usage

1. **Add your profile** - Background, experience, and preferences
2. **Add contact information** - Name, email, location, etc.
3. **Upload your CV** - Paste text directly or upload PDF/Word file
4. **Add job description** - Paste the job posting
5. **Get AI analysis** - Job match recommendation and personalized advice
6. **Generate documents** - Cover letters and optimized resumes

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.0 Flash
- **File Processing**: PDF.js, Mammoth.js
- **Document Export**: jsPDF, docx
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # React components
├── services/           # AI services and API calls
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

## Important Notes

⚠️ **AI-Generated Content Disclaimer**: All outputs are AI-generated and should be reviewed before use.

🔒 **Privacy**: Your data is processed locally and sent to Google's Gemini AI for analysis.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details