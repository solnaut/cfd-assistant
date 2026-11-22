export type MobileWorkbenchPane = 'outline' | 'task' | 'console' | 'guide' | 'graphics'

export function MobileWorkbenchPanes({ active, onSelect }: {
  active: MobileWorkbenchPane
  onSelect: (pane: MobileWorkbenchPane) => void
}) {
  const panes = [
    ['outline', '目录'],
    ['task', '任务'],
    ['console', '日志'],
    ['guide', '说明'],
    ['graphics', '图形'],
  ] as const

  return (
    <div className="fluent-mobile-panes" role="group" aria-label="横屏工作区" lang="zh-CN">
      {panes.map(([pane, title]) => (
        <button
          key={pane}
          type="button"
          aria-pressed={active === pane}
          onClick={() => onSelect(pane)}
        >
          {title}
        </button>
      ))}
    </div>
  )
}
