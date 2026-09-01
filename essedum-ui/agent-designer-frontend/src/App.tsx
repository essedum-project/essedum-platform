import { HashRouter, Routes, Route } from 'react-router-dom';
import Designer from './pages/Designer';
import Deployments from './pages/Deployments';
import NotFound from './pages/NotFound';
import { useParentSession } from './hooks/useParentSession';

export default function App() {
  // Register the shell → iframe message listener once for the entire app.
  // Stores SET_TOKEN / SET_ORGANISATION / SET_PARENT_SESSION in sessionStorage
  // and sends back acks (TOKEN_RECEIVED / ORG_RECEIVED / PARENT_SESSION_RECEIVED).
  useParentSession();

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Designer />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
