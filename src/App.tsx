import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useMatch } from 'react-router-dom'
import CalculatorCategoryPage from './pages/CalculatorCategoryPage'
import CalculatorDetailPage from './pages/CalculatorDetailPage'
import CalculatorsPage from './pages/CalculatorsPage'
import EnergyKnowledgePage from './pages/EnergyKnowledgePage'
import FluentGuidePage from './pages/FluentGuidePage'
import FluentMeshingPage from './pages/FluentMeshingPage'
import FormulaLibraryPage from './pages/FormulaLibraryPage'
import HomePage from './pages/HomePage'
import CfdPracticePage from './pages/CfdPracticePage'
import ThermalLabPage from './pages/ThermalLabPage'
import UnitConverterPage from './pages/UnitConverterPage'
import { GlobalSearchModal } from './components/GlobalSearchModal'
import { MobileFullscreenButton } from './components/MobileFullscreenButton'
import { FluentLauncher } from './fluentMock/components/FluentLauncher'
import PageHeader from './components/PageHeader'
import { OPEN_GLOBAL_SEARCH_EVENT } from './search/globalSearchIndex'
import './App.css'

function App() {
  const isSolutionWorkbench = useMatch('/fluent-guide')
  const isMeshingWorkbench = useMatch('/fluent-meshing')
  const isWorkbench = Boolean(isSolutionWorkbench || isMeshingWorkbench)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    function handleOpenSearch() {
      setSearchOpen(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener(OPEN_GLOBAL_SEARCH_EVENT, handleOpenSearch)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener(OPEN_GLOBAL_SEARCH_EVENT, handleOpenSearch)
    }
  }, [])

  return (
    <div className="app-shell">
      {!isWorkbench && (
        <header className="site-header">
          <div className="brand-block">
            <NavLink to="/" className="brand">
              CFD Assistant
            </NavLink>
          </div>
          <nav className="site-nav" aria-label="Primary navigation">
            <NavLink to="/" end>
              功能首页
            </NavLink>
            <NavLink to="/fluent-meshing">Fluent Meshing</NavLink>
            <NavLink to="/fluent-guide">Fluent 功能导览</NavLink>
            <NavLink to="/calculators">参数计算</NavLink>
            <NavLink to="/formulas">CFD 公式库</NavLink>
            <NavLink to="/cfd-practice">实战向导</NavLink>
            <NavLink to="/thermal-lab">热工实验</NavLink>
            <NavLink to="/knowledge">热流体工程图解</NavLink>
          </nav>
          <div className="site-header-tools">
            <button
              type="button"
              className="site-search-trigger"
              aria-label="打开全站搜索"
              onClick={() => setSearchOpen(true)}
            >
              <span>搜索</span>
              <kbd>Ctrl K</kbd>
            </button>
            <MobileFullscreenButton />
          </div>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fluent-launcher" element={<div className="page fluent-launch-page"><FluentLauncher standalone /></div>} />
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
          <Route path="/cfd-practice" element={<CfdPracticePage />} />
          <Route path="/unit-converter" element={<UnitConverterPage />} />
          <Route path="/thermal-lab" element={<ThermalLabPage />} />
          <Route path="/knowledge" element={<EnergyKnowledgePage />} />
          <Route path="/knowledge/:courseId" element={<EnergyKnowledgePage />} />
          <Route
            path="/knowledge/:courseId/:topicId"
            element={<EnergyKnowledgePage />}
          />
          <Route path="/fluent-meshing" element={<FluentMeshingPage />} />
          <Route path="/fluent-guide" element={<FluentGuidePage />} />
          <Route path="*" element={
            <div className="page">
              <PageHeader title="找不到这个页面" description="请检查地址，或从首页进入工作台。"
                actions={<Link className="button-link" to="/">返回首页</Link>} />
            </div>
          } />
        </Routes>
      </main>

      {!isWorkbench && (
        <footer className="site-footer">
          <span>CFD Assistant</span>
          <span>Responsive web app · v0.1.0</span>
        </footer>
      )}

      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

export default App
