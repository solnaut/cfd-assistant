import katex from 'katex'

interface MathFormulaProps {
  latex: string
}

function MathFormula({ latex }: MathFormulaProps) {
  const html = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
  })

  return (
    <div
      className="math-formula"
      aria-label={latex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default MathFormula
