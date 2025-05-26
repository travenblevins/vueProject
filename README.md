# Vue Movie Explorer

A Vue.js application that displays movie information using TMDB API and Firebase authentication.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment configuration:
   - Navigate to `src/config/`
   - Copy `environment.example.js` to `environment.js`
   - Replace the placeholder values in `environment.js` with your actual credentials:
     - Firebase credentials from your Firebase Console
     - TMDB API key from your TMDB account

4. Run the development server:
```bash
npm run serve
```

## Environment Configuration

The application requires two sets of credentials:

### Firebase Configuration
- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId
- measurementId

### TMDB Configuration
- apiKey

Get these credentials from your respective Firebase and TMDB accounts.

## Security Note

The `environment.js` file containing your actual credentials is gitignored and should never be committed to the repository. Always use `environment.example.js` as a template and create your local `environment.js` with actual credentials.
