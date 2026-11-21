import { useState } from 'react'
import type { FluentLabel } from '../fluentLanguage'
import type { ConsoleEntry } from '../state/fluentSimState'
import { tuiPresetCommands } from '../state/fluentTuiCommands'
import type { FluentMockControl } from '../fluentTypes'

export function ConsolePane({
  activeControlId,
  consoleControl,
  logs,
  label,
  onInspect,
  onClear,
  onRunCommand,
}: {
  activeControlId: string
  consoleControl: FluentMockControl
  logs: ConsoleEntry[]
  label: FluentLabel
  onInspect: (control: FluentMockControl) => void
  onClear: () => void
  onRunCommand: (command: string) => void
}) {
  const [commandText, setCommandText] = useState('')

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!commandText.trim()) return
    onRunCommand(commandText)
    setCommandText('')
  }

  return (
    <section className="fluent-console-pane" aria-label={label('Console')}>
      <div className="fluent-pane-title">
        <button
          type="button"
          data-fluent-control={consoleControl.id}
          className={activeControlId === consoleControl.id ? 'active' : ''}
          onClick={() => onInspect(consoleControl)}
        >
          {label('Console')}
        </button>
        <div className="fluent-console-header-actions">
          <small>{label('Teaching preview')}</small>
          <button type="button" onClick={onClear}>
            {label('Clear')}
          </button>
        </div>
      </div>

      <div className="fluent-console-body">
        <div className="fluent-console-log" role="log" aria-live="polite">
          {logs.map((entry) => (
            <div
              key={entry.id}
              className={`fluent-console-line ${entry.kind}`}
            >
              {entry.text}
            </div>
          ))}
        </div>

        <div className="fluent-console-tui-bar" aria-label="快捷 TUI 命令">
          {tuiPresetCommands.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => onRunCommand(cmd)}
            >
              {cmd}
            </button>
          ))}
        </div>

        <form className="fluent-console-input-row" onSubmit={submit}>
          <span aria-hidden="true">&gt;</span>
          <input
            type="text"
            aria-label="TUI 命令输入"
            placeholder="输入命令，例如 /mesh/check 或 help"
            value={commandText}
            onFocus={() => onInspect(consoleControl)}
            onChange={(event) => setCommandText(event.target.value)}
          />
        </form>
      </div>
    </section>
  )
}
