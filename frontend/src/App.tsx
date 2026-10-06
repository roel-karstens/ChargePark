import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChargingHomePage } from './pages/ChargingHomePage';
import { ChargingResultsPage } from './pages/ChargingResultsPage';
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
        <Route path="/" element={<ChargingHomePage />} />
        <Route path="/results" element={<ChargingResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
