import Breadcrumbs from '../components/Breadcrumbs'
import CalculatorCategoryCard from '../components/CalculatorCategoryCard'
import PageHeader from '../components/PageHeader'
import {
  calculatorCategories,
  getCalculatorsByCategory,
} from '../calculators/registry'

function CalculatorsPage() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: '首页', to: '/' }, { label: '参数计算' }]} />
      <PageHeader
        eyebrow="Calculators"
        title="参数计算"
        description="按工程主题选择计算器分类，进入分类后再选择具体工具。"
      />

      <section className="category-grid" aria-label="Calculator categories">
        {calculatorCategories.map((category) => (
          <CalculatorCategoryCard
            category={category}
            count={getCalculatorsByCategory(category.id).length}
            key={category.id}
          />
        ))}
      </section>
    </div>
  )
}

export default CalculatorsPage
