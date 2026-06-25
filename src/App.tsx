import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReaderPage from './pages/ReaderPage';

function App() {
  return (
    <BrowserRouter basename="/my-flipbook-app/"> {/* sesuaikan dengan base di vite.config */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reader" element={<ReaderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
