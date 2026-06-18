import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard'

function HomePage() {
  return (
    <div className="page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">CFD Assistant</p>
          <h1>面向 CFD 工程人员和 Fluent 初学者的网页辅助工具</h1>
          <p>
            第一阶段只提供纯前端静态网页骨架。计算公式、单位换算和知识内容会在独立模块中维护，专业结论需要审核后再进入正式内容。
          </p>
          <div className="hero-actions">
            <Link className="button-link" to="/calculators">
              参数计算
            </Link>
            <Link className="ghost-button" to="/fluent-guide">
              Fluent 功能导览
            </Link>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Project status">
          <h2>当前版本边界</h2>
          <ul className="status-list">
            <li>
              <span className="status-label">平台</span>
              <span>Web first, PWA ready, Capacitor compatible later</span>
            </li>
            <li>
              <span className="status-label">数据</span>
              <span>本地 JSON 知识库与本地计算模块</span>
            </li>
            <li>
              <span className="status-label">状态</span>
              <span>公式和专业解释均等待内容审核</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="card-grid" aria-label="Main entries">
        <FeatureCard
          title="参数计算"
          description="预留 y+、边界层、CFL、Reynolds、Mach 等计算器入口。当前只建立定义结构，不实现未经确认的公式。"
          tag="Calculator"
          to="/calculators"
        />
        <FeatureCard
          title="Fluent 功能导览"
          description="使用自主设计的教学界面读取本地知识库条目，帮助初学者理解功能路径和设置项。"
          tag="Guide"
          to="/fluent-guide"
        />
      </section>

      <section className="notice">
        <h2>预留内容</h2>
        <p>关于项目、更新记录、使用说明、内容版本和反馈方式将在后续阶段补充。</p>
        <ul className="reserved-list">
          <li>关于项目</li>
          <li>更新记录</li>
          <li>使用说明</li>
          <li>内容版本</li>
          <li>反馈方式</li>
        </ul>
      </section>
    </div>
  )
}

export default HomePage
