import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CasesPage from './pages/CasesPage'
import CasePage from './pages/CasePage'
import BrowsePage from './pages/BrowsePage'
import NotFoundPage from './pages/NotFoundPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="cases" element={<CasesPage />} />
      <Route path="cases/:id" element={<CasePage />} />
      <Route path="browse" element={<BrowsePage />} />
      <Route path="browse/:category" element={<BrowsePage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="not-found" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
}
