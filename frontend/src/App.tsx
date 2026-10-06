import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MapBasedHomePage } from './pages/MapBasedHomePage';
import { ResultsPage } from './pages/ChargingResultsPage';
import './App.css';

/**
 * ChargePark MVP App
 *
 * Routes:
 * - / → HomePage (search)
 * - /results → ResultsPage (results with map + list)
 *
 * No authentication in MVP (stateless searches)
 */
export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapBasedHomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
