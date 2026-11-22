import { Link } from 'react-router-dom'
import cover from '../components/flow-field-cover.webp'
import { FluentLauncher } from '../fluentMock/components/FluentLauncher'
import './homeCover.css'

const workspaces = [
  { title: '热流体工程图解', label: '原理', to: '/knowledge', description: '从流体力学、工程热力学、传热学与制冷原理理解方程和设备。' },
  { title: 'Fluent Meshing 网格工作台', label: '网格', to: '/fluent-meshing', description: '练习水密与容错工作流，设置局部尺寸、边界层和体网格。' },
  { title: 'Fluent Solution 求解工作台', label: '求解', to: '/fluent-guide', description: '练习物理模型、边界条件、求解与后处理，随操作查看控件说明。' },
]

const tools = [
  { title: '参数计算', to: '/calculators', description: '雷诺数、时间步、第一层网格高度等工程计算。' },
  { title: '工程单位换算', to: '/unit-converter', description: '核对物性、几何和边界输入的单位。' },
  { title: 'CFD 公式库', to: '/formulas', description: '查定义、适用条件和 LaTeX 源码。' },
  { title: 'CFD 实战向导', to: '/cfd-practice', description: '按工况选模型，按症状排查错误。' },
  { title: '热工交互实验室', to: '/thermal-lab', description: '调参数，观察循环与换热性能如何变化。' },
]

function HomePage() {
  return (
    <div className="page home-page">
      <section className="cover">
        <div className="cover-copy">
          <p className="cover-kicker">CFD ASSISTANT</p>
          <h1>从流动与传热，到 Fluent 实操</h1>
          <p>核对工况参数，练习从网格划分到求解设置。</p>
          <div className="cover-actions">
            <Link to="/fluent-guide">进入求解工作台 <span aria-hidden="true">↗</span></Link>
            <Link to="/knowledge">阅读热流体工程图解 <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <figure className="cover-figure">
          <img src={cover} alt="均匀来流绕圆柱的流线，圆柱两侧流线汇集，速度升高" width="1380" height="1000" fetchPriority="high" />
          <figcaption>圆柱绕流 · 理想势流示意</figcaption>
        </figure>
      </section>

      <section className="cover-workspaces" aria-label="学习工作台">
        {workspaces.map(({ title, label, to, description }) => (
          <Link key={to} className="cover-workspace" to={to}>
            <span className="cover-workspace-type">{label}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            <span className="cover-workspace-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>

      <div className="cover-resources">
        <section className="cover-toolbox" aria-labelledby="cover-toolbox-title">
          <h2 id="cover-toolbox-title">工程工具</h2>
          {tools.map(({ title, to, description }) => (
            <Link key={to} to={to} className="cover-tool">
              <div><strong>{title}</strong><small>{description}</small></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>
        <FluentLauncher />
      </div>
    </div>
  )
}

export default HomePage
