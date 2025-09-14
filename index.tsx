import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { ToastProvider, ToastViewport } from './components/Toast';

/**
 * Main entry point for the NUTRIA MACRO application
 * Initializes React and renders the root App component
 */
function main() {
  // Get the root element from the DOM
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.');
  }

  // Create React root and render the application
  const root = createRoot(rootElement);
  
  // Render the App component
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <App />
        <ToastViewport />
      </ToastProvider>
    </React.StrictMode>
  );
}

// Initialize the application when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// Export for potential testing or module usage
export default main;
