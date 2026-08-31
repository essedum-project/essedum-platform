import { HashRouter, Routes, Route } from 'react-router-dom';
import Designer from './pages/Designer';
import Deployments from './pages/Deployments';
import NotFound from './pages/NotFound';

export default function App() {
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
