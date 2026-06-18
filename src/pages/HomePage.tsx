import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard'
import HeroWorkbenchVisual from '../components/HeroWorkbenchVisual'

function HomePage() {
  return (
    <div className="page home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">CFD Assistant</p>
          <h1>更清晰地完成 CFD 参数整理与 Fluent 功能学习</h1>
          <p>
            一个面向浏览器的工程辅助工作台，把常用计算器和 Fluent 学习导览放在同一套清爽界面中，适配手机、平板和电脑。
          </p>
          <div className="hero-actions">
            <Link className="button-link" to="/calculators">
              开始参数计算
            </Link>
            <Link className="ghost-button" to="/fluent-guide">
              查看 Fluent 导览
            </Link>
          </div>
        </div>

        <HeroWorkbenchVisual />
      </section>

      <section className="feature-grid" aria-label="Main entries">
        <FeatureCard
          title="参数计算"
          description="按网格、瞬态、无量纲数等主题组织计算器，提供输入校验、单位换算和结果展示。"
          eyebrow="Calculators"
          actionLabel="进入计算器"
          to="/calculators"
        />
        <FeatureCard
          title="CFD 公式库"
          description="集中查看当前计算器使用的公式、变量说明和可复制 LaTeX，便于快速核对。"
          eyebrow="Formulas"
          actionLabel="查看公式"
          to="/formulas"
        />
        <FeatureCard
          title="Fluent 功能导览"
          description="通过教学化功能树快速定位设置项，并在侧边面板查看对应解释和使用线索。"
          eyebrow="Fluent guide"
          actionLabel="进入导览"
          to="/fluent-guide"
        />
      </section>
    </div>
  )
}

export default HomePage
