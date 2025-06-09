# SundayInsurance: Smart Vehicle Insurance

A modern vehicle insurance comparison platform built with React + TypeScript + Vite that helps users find the best insurance quotes from top insurers.

## Features

- 🔍 Smart quote analysis and recommendations
- 🔍 Real-time insurance quote comparison
- 🚗 Comprehensive vehicle coverage options
- 📱 Responsive design with modern UI
- ⚡ Fast performance with Vite build system
- 🔄 Multi-step car selection flow (Brand → Model → Fuel Type → Variant → Registration Place)
- 🎯 Dynamic vehicle data loading (ready for API integration)

## Car Selection Flow

The application implements a comprehensive 5-step car selection process:

1. **Brand Selection** - Choose from top car manufacturers
2. **Model Selection** - Select specific car model based on brand
3. **Fuel Type** - Choose between Petrol, Diesel, CNG, Electric, or Hybrid
4. **Variant Selection** - Pick the specific variant/trim level
5. **Registration Place** - Select vehicle registration state/location

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **State Management**: React useState/useEffect

## Backend Requirements (To Be Implemented)

### Recommended Stack Options:

#### Option 1: Node.js + Express + MongoDB
```bash
# Backend setup
npm init -y
npm install express mongoose cors dotenv
npm install -D nodemon @types/node typescript
```

#### Option 2: Firebase (Recommended for rapid development)
```bash
npm install firebase
```

#### Option 3: Supabase (PostgreSQL + Real-time API)
```bash
npm install @supabase/supabase-js
```

### Required API Endpoints:

1. **GET /api/brands** - Fetch all car brands
2. **GET /api/models/:brandId** - Fetch models for a specific brand
3. **GET /api/fuel-types/:modelId** - Fetch available fuel types for a model
4. **GET /api/variants/:modelId/:fuelType** - Fetch variants for model + fuel type
5. **GET /api/registration-places** - Fetch all registration locations
6. **POST /api/quotes** - Generate insurance quotes based on car details

### Database Schema Example:

```json
{
  "brands": [
    {
      "id": "ford",
      "name": "Ford",
      "logo": "url_to_logo",
      "models": ["ecosport", "endeavour"]
    }
  ],
  "models": [
    {
      "id": "ecosport",
      "name": "EcoSport",
      "brandId": "ford",
      "fuelTypes": ["petrol", "diesel"],
      "variants": [
        {
          "id": "titanium",
          "name": "Titanium",
          "fuelType": "petrol",
          "engine": "1.5L",
          "price": 800000
        }
      ]
    }
  ],
  "registrationPlaces": [
    {"code": "DL", "name": "Delhi"},
    {"code": "MH", "name": "Maharashtra"}
  ]
}
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
