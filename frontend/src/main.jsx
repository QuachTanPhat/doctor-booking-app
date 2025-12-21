import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import  AppContextProvider from './context/AppContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
createRoot(document.getElementById('root')).render(
  
  <BrowserRouter>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>,
)
