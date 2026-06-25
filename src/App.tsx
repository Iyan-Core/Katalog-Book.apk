import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homePage';
import ReaderPage from './pages/readerPage';

function App() {
  return (
    <BrowserRouter basename="/Katalog-Book-apk/"> {/* sesuaikan dengan base di vite.config */}
      <Routes>
        <Route path="/" element={<homePage />} />
        <Route path="/reader" element={<readerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
