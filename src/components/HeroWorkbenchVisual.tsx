function HeroWorkbenchVisual() {
  return (
    <aside className="hero-visual workbench-visual" aria-label="CFD Assistant product preview">
      <div className="workbench-topbar">
        <span className="workbench-chip">CFD Workbench</span>
        <span className="workbench-status">Formula + Guide</span>
      </div>

      <div className="workbench-grid">
        <section className="workbench-card formula-card" aria-label="Calculator preview">
          <div className="workbench-card-header">
            <span>参数计算</span>
            <strong>Reynolds</strong>
          </div>
          <div className="formula-equation">Re = ρUL / μ</div>
          <div className="mini-form">
            <span>ρ</span>
            <strong>1.225 kg/m³</strong>
            <span>U</span>
            <strong>10 m/s</strong>
            <span>L</span>
            <strong>1 m</strong>
          </div>
          <div className="result-strip">
            <span>Result</span>
            <strong>6.84587e+5</strong>
          </div>
        </section>

        <section className="workbench-card guide-card" aria-label="Fluent guide preview">
          <div className="workbench-card-header">
            <span>Fluent 导览</span>
            <strong>Boundary</strong>
          </div>
          <div className="guide-mini-layout">
            <div className="guide-tree-mini">
              <span className="active">Velocity Inlet</span>
              <span>Wall</span>
              <span>Pressure Outlet</span>
            </div>
            <div className="guide-task-mini">
              <span className="field">Velocity Magnitude</span>
              <span className="field select">Turbulence</span>
              <span className="field button">Edit...</span>
            </div>
          </div>
          <div className="explain-strip">
            <span>点击控件</span>
            <strong>显示解释与注意事项</strong>
          </div>
        </section>
      </div>

      <div className="workbench-footer">
        <span>单位换算</span>
        <span>公式库</span>
        <span>复制摘要</span>
      </div>
    </aside>
  )
}

export default HeroWorkbenchVisual
