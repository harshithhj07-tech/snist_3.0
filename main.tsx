import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { CitizenContextProvider } from './context/CitizenContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <CitizenContextProvider>
          <App />
        </CitizenContextProvider>
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
);
