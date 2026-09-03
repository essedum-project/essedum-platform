import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FlowProvider } from './store/FlowContext'

// Apply theme from localStorage on first paint (avoids flash)
const savedTheme = localStorage.getItem('theme') ?? 'dark';
document.documentElement.classList.toggle('dark', savedTheme === 'dark');

// Listen for SET_THEME from parent shell so the theme tracks the main app toggle
window.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg?.type === 'SET_THEME') {
    const theme: string = msg.theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlowProvider>
      <App />
    </FlowProvider>
  </StrictMode>,
)
