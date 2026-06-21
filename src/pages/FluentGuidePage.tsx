import Breadcrumbs from '../components/Breadcrumbs'
import PageHeader from '../components/PageHeader'
import FluentSolverMock from '../fluentMock/FluentSolverMock'

function FluentGuidePage() {
  return (
    <div className="page fluent-page">
      <Breadcrumbs
        items={[{ label: '首页', to: '/' }, { label: 'Fluent 功能导览' }]}
      />
      <PageHeader
        eyebrow="Fluent guide"
        title="Fluent 功能导览"
        description="通过自主设计的 Fluent Solver 教学模拟器学习 Ribbon、功能树、任务页、图形窗口、控制台和常见设置窗口。"
      />

      <FluentSolverMock />
    </div>
  )
}

export default FluentGuidePage
