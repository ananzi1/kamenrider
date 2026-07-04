import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SeriesPage from './pages/SeriesPage'
import PlayerPage from './pages/PlayerPage'
import HistoryPage from './pages/HistoryPage'

export default function App(): JSX.Element {
  return (
    <HashRouter>
      <div className="w-full h-full flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/series/:seriesName" element={<SeriesPage />} />
          <Route path="/player/:videoId" element={<PlayerPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
