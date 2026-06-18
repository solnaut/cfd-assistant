import { NavLink, Route, Routes } from 'react-router-dom'
import CalculatorCategoryPage from './pages/CalculatorCategoryPage'
import CalculatorDetailPage from './pages/CalculatorDetailPage'
import CalculatorsPage from './pages/CalculatorsPage'
import FluentGuidePage from './pages/FluentGuidePage'
import FormulaLibraryPage from './pages/FormulaLibraryPage'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <NavLink to="/" className="brand">
            CFD Assistant
          </NavLink>
          <span>工程计算与学习辅助</span>
        </div>
        <nav className="site-nav" aria-label="Primary navigation">
          <NavLink to="/calculators">参数计算</NavLink>
          <NavLink to="/formulas">CFD 公式库</NavLink>
          <NavLink to="/fluent-guide">Fluent 功能导览</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route
            path="/calculators/:categoryId"
            element={<CalculatorCategoryPage />}
          />
          <Route
            path="/calculators/:categoryId/:calculatorId"
            element={<CalculatorDetailPage />}
          />
          <Route path="/formulas" element={<FormulaLibraryPage />} />
          <Route path="/fluent-guide" element={<FluentGuidePage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <span>CFD Assistant</span>
        <span>Responsive web app · v0.1.0</span>
      </footer>
    </div>
  )
}

export default App
