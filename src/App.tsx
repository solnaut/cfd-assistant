import { NavLink, Route, Routes } from 'react-router-dom'
import CalculatorsPage from './pages/CalculatorsPage'
import FluentGuidePage from './pages/FluentGuidePage'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">Independent CFD learning tool</p>
          <NavLink to="/" className="brand">
            CFD Assistant
          </NavLink>
        </div>
        <nav className="site-nav" aria-label="Primary navigation">
          <NavLink to="/calculators">参数计算</NavLink>
          <NavLink to="/fluent-guide">Fluent 功能导览</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/fluent-guide" element={<FluentGuidePage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <span>第三方独立学习辅助工具，非 Ansys 官方产品。</span>
        <span>App v0.1.0 · Content TODO</span>
      </footer>
    </div>
  )
}

export default App
