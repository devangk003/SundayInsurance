# 🚗 SundayInsurance

**AI-powered vehicle insurance comparison platform for India**

Get quotes from 50+ insurance providers in under 3 minutes with intelligent recommendations based on your vehicle and profile.

## 🌟 Features

- **Smart Quote Comparison**: AI-powered analysis of 50+ insurance providers
- **Real-time Processing**: Get accurate quotes in under 3 minutes
- **Comprehensive Coverage**: Supports 50+ vehicle brands across 28 Indian states
- **Mobile Optimized**: Responsive design for seamless mobile experience
- **Secure Authentication**: Firebase-powered user management with modal-based login
- **Interactive UI**: Smooth animations and modern design with Framer Motion

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for modern, utility-first styling
- **Framer Motion** for smooth animations and transitions
- **Firebase Auth** for secure user authentication
- **Vite** for fast development and optimized builds
- **React Context API** for efficient state management

### Backend
- **Node.js** with Express framework
- **TypeScript** for robust backend development
- **Chrome Puppeteer** for automated insurance data scraping
- **RESTful API** architecture for scalable integration
- **Winston** for comprehensive logging
- **CORS** enabled for cross-origin requests

### Automation
- **Chrome Browser Automation** for real-time quote extraction
- **PowerShell Scripts** for deployment and automation
- **Error Handling** with comprehensive logging and monitoring

## 📊 Project Impact

- 🏢 **50+ Insurance Providers** integrated for comprehensive comparison
- 🚗 **50+ Vehicle Brands** supported (from Maruti to Lamborghini)
- 📍 **28 States Coverage** across India
- 👥 **2L+ Customers** served with personalized quotes
- 💰 **₹50L+ Claims** processed through platform recommendations

## �️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Chrome browser (for scraping automation)
- Git for version control

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

### ScraperAPI Setup
```bash
# Navigate to ScraperAPI directory
cd ScraperAPI

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the scraper service
npm start
```

## 🔧 Configuration

### Frontend Environment Variables (.env.local)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:3001
```

### Backend Environment Variables (.env)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 📱 How It Works

### User Journey
1. **Vehicle Selection**: Choose your vehicle brand, model, and variant
2. **Profile Details**: Enter registration number and basic information
3. **AI Analysis**: Our system analyzes 50+ insurance providers in real-time
4. **Smart Recommendations**: Receive personalized quotes with AI-powered insights
5. **Easy Comparison**: Compare features, coverage, and pricing side-by-side
6. **Secure Signup**: Create account to access detailed quotes and save preferences

### Technical Flow
1. **Frontend** collects user data through intuitive forms
2. **Backend API** processes requests and triggers scraping automation
3. **ScraperAPI** extracts real-time quotes from insurance provider websites
4. **AI Engine** analyzes quotes and generates personalized recommendations
5. **Results** are displayed with interactive comparison cards

## 🎨 Key Features

### Smart Authentication System
- Modal-based login/signup with auto-close on success
- Real-time authentication state management
- Secure Firebase integration

### AI-Powered Quote Engine
- Analysis of 10,000+ customer reviews for insights
- Market trend analysis for optimal recommendations
- Vehicle-specific coverage optimization
- Real-time price comparison algorithms

### Premium User Experience
- Hardware-accelerated animations for smooth performance
- Mobile-first responsive design
- Interactive form validation with real-time feedback
- Progressive loading states and error handling

## � Deployment

### Frontend (Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

### Backend (Render/Railway)
```bash
cd backend
# Deploy to your preferred Node.js hosting platform
# Configure environment variables in hosting dashboard
```

### Full-Stack Options
- **Vercel** - Deploy both frontend and API routes
- **Railway** - Full-stack deployment with database
- **Render** - Separate frontend and backend services

## 📈 Performance Optimizations

- **Code Splitting** for optimal bundle sizes
- **Lazy Loading** for improved initial load times
- **Hardware Acceleration** for smooth animations
- **API Response Caching** for faster quote retrieval
- **Image Optimization** for faster loading
- **Progressive Web App** features for mobile experience

## 🔒 Security Features

- Firebase Authentication with secure token management
- Input validation and sanitization on all forms
- HTTPS enforcement in production environments
- Rate limiting on API endpoints
- Secure environment variable management

## 🤝 Contributing

This is a personal project showcasing full-stack development skills. For feedback or suggestions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📄 License

Private project - All rights reserved.

## 🙏 Acknowledgments

- **Firebase** for robust authentication services
- **Tailwind CSS** for the comprehensive design system
- **Framer Motion** for smooth animation capabilities
- **React Community** for excellent ecosystem and documentation
- **Node.js Community** for powerful backend capabilities

---

**SundayInsurance** - Making vehicle insurance simple, transparent, and affordable for everyone in India.

*Built with ❤️ using modern web technologies and AI-powered insights.*
