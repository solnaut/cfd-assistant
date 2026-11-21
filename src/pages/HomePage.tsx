import { useState } from 'react'
import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard'
import {
  buildLauncherQuery,
  type FluentDimension,
  type FluentWorkbenchMode,
} from '../fluentMock/state/fluentWorkbenchBridge'

function HomePage() {
  const [mode, setMode] = useState<FluentWorkbenchMode>('meshing')
  const [dimension, setDimension] = useState<FluentDimension>('3d')
  const [doublePrecision, setDoublePrecision] = useState(true)
  const [processes, setProcesses] = useState(4)

  const launchQuery = buildLauncherQuery({
    mode,
    dimension,
    doublePrecision,
    processes,
  })
  const launchTo =
    mode === 'meshing'
      ? `/fluent-meshing?${launchQuery}`
      : `/fluent-guide?${launchQuery}`

  return (
    <div className="page home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">CFD Assistant · 功能选择中心</p>
          <h1>更清晰地完成 CFD 参数整理与 Fluent 功能学习</h1>
          <p>
            在一个工作台内串联前处理与求解全流程：先通过 CFD 参数计算器估算工况与第一层网格，再进入 Fluent Meshing 练习水密几何网格划分并切换至 Fluent Solution 完成物理模型与求解设置。
          </p>
          <div className="hero-actions">
            <Link className="button-link" to="/fluent-meshing">
              进入 Fluent Meshing
            </Link>
            <Link className="ghost-button" to="/fluent-guide">
              进入 Fluent 求解器
            </Link>
            <Link className="ghost-button" to="/calculators">
              开始参数计算
            </Link>
          </div>
        </div>

        <aside
          className="hero-visual launcher-card"
          aria-label="Fluent Launcher 配置器"
        >
          <div className="workbench-topbar">
            <span className="workbench-chip">Fluent Launcher · Teaching</span>
            <span className="workbench-status">纯前端教学模拟</span>
          </div>

          <div className="launcher-section">
            <span className="launcher-label">工作模式 (Mode)</span>
            <div className="launcher-segmented" role="group" aria-label="工作模式">
              <button
                type="button"
                className={mode === 'meshing' ? 'active' : ''}
                aria-pressed={mode === 'meshing'}
                onClick={() => setMode('meshing')}
              >
                <strong>Meshing</strong>
                <small>水密网格划分工作流</small>
              </button>
              <button
                type="button"
                className={mode === 'solution' ? 'active' : ''}
                aria-pressed={mode === 'solution'}
                onClick={() => setMode('solution')}
              >
                <strong>Solution</strong>
                <small>求解设置与后处理</small>
              </button>
            </div>
          </div>

          <div className="launcher-options-grid">
            <div className="launcher-field">
              <span className="launcher-label">维度 (Dimension)</span>
              <div className="launcher-pills" role="group" aria-label="维度选择">
                <button
                  type="button"
                  className={dimension === '3d' ? 'active' : ''}
                  aria-pressed={dimension === '3d'}
                  onClick={() => setDimension('3d')}
                >
                  3D
                </button>
                <button
                  type="button"
                  className={dimension === '2d' ? 'active' : ''}
                  aria-pressed={dimension === '2d'}
                  onClick={() => setDimension('2d')}
                >
                  2D
                </button>
              </div>
            </div>

            <label className="launcher-field" htmlFor="launcher-processes">
              <span className="launcher-label">并行核心 (Solver Processes)</span>
              <select
                id="launcher-processes"
                value={processes}
                onChange={(event) =>
                  setProcesses(Number.parseInt(event.target.value, 10) || 4)
                }
              >
                <option value={1}>1 (Serial)</option>
                <option value={4}>4 Processes</option>
                <option value={8}>8 Processes</option>
                <option value={16}>16 Processes</option>
              </select>
            </label>
          </div>

          <label className="launcher-checkbox">
            <input
              type="checkbox"
              checked={doublePrecision}
              onChange={(event) => setDoublePrecision(event.target.checked)}
            />
            <span>Double Precision (双精度求解 / 推荐边界层与大尺度比算例)</span>
          </label>

          <div className="launcher-footer">
            <code>
              {`[${dimension}, ${doublePrecision ? 'dp' : 'sp'}, ${mode === 'meshing' ? 'meshing' : 'pbns'}, np=${processes}]`}
            </code>
            <Link className="button-link" to={launchTo}>
              {mode === 'meshing'
                ? '启动 Fluent Meshing →'
                : '启动 Fluent Solution →'}
            </Link>
          </div>
        </aside>
      </section>

      <section className="feature-grid" aria-label="Main entries">
        <FeatureCard
          title="Fluent Meshing 网格工作台"
          description="完整复刻 Watertight Geometry 水密工作流（导入几何、局部尺寸 BOI、面网格、描述几何、共享拓扑、更新边界与区域、边界层、Poly-Hexcore 体网格与改善质量），支持一键 Switch to Solution。"
          eyebrow="Preprocessing · Meshing"
          actionLabel="进入 Fluent Meshing"
          to="/fluent-meshing"
        />
        <FeatureCard
          title="Fluent Solution 求解工作台"
          description="对齐 Fluent Solver 真实界面：11 个完整 Ribbon 标签页、11 项物理模型、12 类边界条件、可拖拽多级弹窗栈、交互式 3D 视口、TUI 控制台及实时中文教学说明。"
          eyebrow="Fluent Guide · Solution"
          actionLabel="进入 Fluent 求解器"
          to="/fluent-guide"
        />
        <FeatureCard
          title="参数计算"
          description="按网格、瞬态、无量纲数、流动管道和传热分类组织 25+ 工程计算器，支持输入校验、常用单位互换、y+ 边界层推荐与一键复制结果。"
          eyebrow="Calculators"
          actionLabel="进入计算器"
          to="/calculators"
        />
        <FeatureCard
          title="CFD 公式库"
          description="集中查阅各计算器背后使用的控制方程与经验关联式、变量物理意义、适用边界说明与可复制 LaTeX 源码，便于撰写报告与核对。"
          eyebrow="Formulas"
          actionLabel="查看公式"
          to="/formulas"
        />
      </section>

      <section className="workflow-strip" aria-label="CFD 学习工作流">
        <div className="workflow-strip-head">
          <p className="eyebrow">Recommended Workflow</p>
          <h2>推荐 CFD 工程与学习串联路径</h2>
        </div>
        <div className="workflow-steps-row">
          <Link className="workflow-step-card" to="/calculators/near-wall-mesh/y-plus-first-layer-height">
            <span className="workflow-step-num">①</span>
            <div>
              <strong>参数估算</strong>
              <small>计算 Re、y+ 与第一层网格高度 h1</small>
            </div>
          </Link>
          <Link className="workflow-step-card" to="/fluent-meshing">
            <span className="workflow-step-num">②</span>
            <div>
              <strong>Fluent Meshing 划分网格</strong>
              <small>设置 BOI、边界层与 Poly-Hexcore 体网格</small>
            </div>
          </Link>
          <Link className="workflow-step-card" to="/fluent-guide">
            <span className="workflow-step-num">③</span>
            <div>
              <strong>Fluent Solution 求解设置</strong>
              <small>Switch to Solution 后设置模型、边界与迭代</small>
            </div>
          </Link>
          <Link className="workflow-step-card" to="/formulas">
            <span className="workflow-step-num">④</span>
            <div>
              <strong>CFD 公式核对</strong>
              <small>核对无量纲数定义与复制 LaTeX 公式</small>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
