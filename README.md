# SundayInsurance: Smart Vehicle Insurance Platform

A comprehensive insurance platform that helps users find the best vehicle insurance quotes from top insurers in India. The platform consists of a modern React frontend and a Node.js backend with web scraping capabilities.

## 🚀 Features

### Frontend Features
- **Smart Quote Platform**: Compare insurance quotes from multiple providers
- **User Authentication**: Firebase-based authentication system
- **Responsive Design**: Modern, mobile-first UI built with React and Tailwind CSS
- **Interactive Car Selection**: Multi-step car brand, model, and variant selection
- **Real-time Updates**: Live quote fetching with loading states
- **About Us Page**: Comprehensive company information and team details

### Backend Features
- **Web Scraping API**: Automated quote collection from insurance websites
- **Quote Processing**: Real-time quote extraction and formatting
- **Error Handling**: Comprehensive error management and logging
- **Rate Limiting**: API protection and usage control
- **CORS Support**: Cross-origin request handling

## 🏗️ Project Structure

```
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components (Home, About Us)
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API services
│   │   └── lib/            # Utilities and configurations
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
├── ScraperAPI/              # Node.js backend API
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── controllers/    # Request controllers
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Express middlewares
│   │   └── utils/          # Utility functions
│   └── package.json        # Backend dependencies
│
└── README.md               # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **Firebase** - Authentication and backend services
- **Framer Motion** - Animation library
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **Puppeteer** - Web scraping and browser automation
- **Winston** - Logging library
- **CORS** - Cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Frontend Setup

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create environment file:
   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Configure Firebase in `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

5. Start the development server:
   ```powershell
   npm run dev
   ```

### Backend Setup

1. Navigate to the ScraperAPI directory:
   ```powershell
   cd ScraperAPI
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Build the TypeScript code:
   ```powershell
   npm run build
   ```

4. Start the server:
   ```powershell
   npm start
   ```

   Or for development with auto-reload:
   ```powershell
   npm run dev
   ```

## 📝 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### Get Insurance Quotes
```http
POST /api/quotes
```

**Request Body:**
```json
{
  "carReg": "DL01AB1234",
  "phoneNumber": "9876543210",
  "isPolicyExpired": true,
  "hasMadeClaim": false,
  "isNewCar": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quotes": [
      {
        "company": "HDFC ERGO",
        "premium": "₹5,234",
        "coverage": "Comprehensive",
        "features": ["Zero Depreciation", "Engine Protection"]
      }
    ]
  }
}
```

## 🎨 UI Components

The frontend includes a comprehensive set of reusable UI components:

- **Authentication Components**: Login, Signup modals with Firebase integration
- **Form Components**: Input fields, search selects, validation
- **Quote Components**: Quote results display, loading states
- **Navigation**: Responsive header with smooth animations
- **Cards**: Service cards, testimonial cards, feature cards

## 🔧 Configuration

### Frontend Configuration
- **Vite Config**: `vite.config.ts`
- **Tailwind Config**: `tailwind.config.ts`
- **TypeScript Config**: `tsconfig.json`

### Backend Configuration
- **Server Config**: `src/config/config.ts`
- **TypeScript Config**: `tsconfig.json`

## 🚦 Scripts

### Frontend Scripts
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Scripts
```powershell
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm start            # Start production server
npm run test         # Run tests
```

## 🔐 Environment Variables

### Frontend (.env.local)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 📱 Features in Detail

### Quote Platform
- Multi-step car selection process
- Real-time quote fetching from multiple insurers
- Comprehensive quote analysis with features
- User authentication for detailed quotes

### About Us Page
- Company information and mission
- Team member profiles
- Core values and statistics
- Contact information

### User Experience
- Smooth animations and transitions
- Responsive design for all devices
- Loading states and error handling
- Auto-scroll to results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@sundayinsurance.com or join our Discord channel.

## 🙏 Acknowledgments

- Firebase for authentication services
- Tailwind CSS for the design system
- Framer Motion for animations
- The React and Node.js communities

---

**SundayInsurance** - Making insurance simple, transparent, and accessible for everyone.
