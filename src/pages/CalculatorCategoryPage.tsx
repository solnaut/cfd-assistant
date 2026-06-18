import { Link, Navigate, useParams } from 'react-router-dom'
import {
  getCalculatorCategory,
  getCalculatorsByCategory,
} from '../calculators/registry'
import Breadcrumbs from '../components/Breadcrumbs'
import CalculatorListCard from '../components/CalculatorListCard'
import PageHeader from '../components/PageHeader'

function CalculatorCategoryPage() {
  const { categoryId } = useParams()
  const category = categoryId ? getCalculatorCategory(categoryId) : null

  if (!category || !categoryId) {
    return <Navigate replace to="/calculators" />
  }

  const calculators = getCalculatorsByCategory(categoryId)

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: '首页', to: '/' },
          { label: '参数计算', to: '/calculators' },
          { label: category.name },
        ]}
      />
      <PageHeader
        eyebrow={category.eyebrow}
        title={category.name}
        description={category.description}
        actions={
          <Link className="ghost-button" to="/calculators">
            返回分类
          </Link>
        }
      />

      <section className="calculator-list" aria-label={`${category.name} calculators`}>
        {calculators.map((calculator) => (
          <CalculatorListCard calculator={calculator} key={calculator.id} />
        ))}
      </section>
    </div>
  )
}

export default CalculatorCategoryPage
