import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FluentIcon } from '../FluentIcons'
import {
  buildLauncherQuery,
  DEFAULT_LAUNCHER_PREFERENCES,
  saveLauncherPreferences,
  type FluentDimension,
  type FluentLauncherPreferences,
  type FluentWorkbenchMode,
} from '../state/fluentWorkbenchBridge'

const launcherDocumentation =
  'https://ansyshelp.ansys.com/public/Views/Secured/corp/v261/en/flu_ug/flu_ug_startramp.html#flu_ug_sec_mini_launcher'

type LauncherMoreTab =
  | 'general'
  | 'parallel'
  | 'environment'
  | 'scheduler'
  | 'solver-summary'

const moreTabs: Array<{ id: LauncherMoreTab; label: string }> = [
  { id: 'general', label: 'General Options' },
  { id: 'parallel', label: 'Parallel Settings' },
  { id: 'environment', label: 'Environment' },
  { id: 'scheduler', label: 'Scheduler' },
  { id: 'solver-summary', label: 'Solver / Meshing' },
]

export function FluentLauncher({ standalone = false }: { standalone?: boolean }) {
  const [mode, setMode] = useState<FluentWorkbenchMode>('meshing')
  const [dimension, setDimension] = useState<FluentDimension>('3d')
  const [solutionDoublePrecision, setSolutionDoublePrecision] = useState(false)
  const [processInput, setProcessInput] = useState('4')
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true)
  const [showMoreOptions, setShowMoreOptions] = useState(standalone)
  const [moreTab, setMoreTab] = useState<LauncherMoreTab>('general')
  const [prefs, setPrefs] = useState<FluentLauncherPreferences>(
    DEFAULT_LAUNCHER_PREFERENCES,
  )

  const meshing = mode === 'meshing'
  const doublePrecision = meshing || solutionDoublePrecision
  const processes = Number(processInput)
  const validProcesses = /^\d+$/.test(processInput) && processes >= 1 && processes <= 64
  const canLaunch = validProcesses && disclaimerAccepted
  const destination = meshing ? '/fluent-meshing' : '/fluent-guide'
  const launchTo = canLaunch
    ? `${destination}?${buildLauncherQuery({ mode, dimension, doublePrecision, processes })}`
    : ''
  const startLabel = meshing ? '启动 Fluent Meshing' : '启动 Fluent Solution'
  const Heading = standalone ? 'h1' : 'h2'

  const effectiveProcesses =
    prefs.parallelMode === 'serial' ? 0 : validProcesses ? processes : '—'
  const cliPreview = `[${dimension}, ${doublePrecision ? 'dp' : 'sp'}, ${mode}, np=${effectiveProcesses}] -t${effectiveProcesses} -driver ${prefs.graphicsDriver}`

  function updatePrefs<K extends keyof FluentLauncherPreferences>(
    key: K,
    value: FluentLauncherPreferences[K],
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  function handleLaunch() {
    saveLauncherPreferences({
      ...prefs,
      parallelMode: prefs.parallelMode,
    })
  }

  return (
    <aside
      className={
        'hero-visual launcher-card launcher-native-window' +
        (prefs.theme === 'dark' ? ' launcher-dark-preview' : '')
      }
      aria-label="Fluent Launcher 配置器"
    >
      <div className="launcher-window-titlebar">
        <div className="launcher-window-brand">
          <span className="launcher-emblem" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" rx="3" fill="#0078d4" />
              <path d="M5 13c2-5 5-6 10-7-2 4-5 6-10 7z" fill="#fbbf24" />
              <path d="M6 15h8" stroke="#e0f2fe" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <Heading>Fluent Launcher</Heading>
            <small>CFD Assistant · 教学仿真复刻启动器 (无官方 Logo)</small>
          </div>
        </div>
        <a href={launcherDocumentation} target="_blank" rel="noreferrer">
          2026 R1 手册 ↗
        </a>
      </div>

      <div className="launcher-disclaimer-box" role="note" aria-label="教学复刻声明">
        <strong>进入前声明 · 个人教学仿真界面</strong>
        <p>
          本界面无实际 CFD 求解与网格计算功能，仅为个人学习 Fluid / Fluent 界面交互与设置逻辑的教学复刻版本，不含任何 Ansys / Fluent 官方商标 Logo。
        </p>
        <label className="launcher-disclaimer-ack">
          <input
            type="checkbox"
            checked={disclaimerAccepted}
            onChange={(event) => setDisclaimerAccepted(event.target.checked)}
          />
          <span>我已知悉：本界面无实际功能，仅为教学复刻界面</span>
        </label>
        {!disclaimerAccepted && (
          <p className="launcher-process-error" role="alert">
            请先勾选确认已阅读上述教学复刻声明后再启动工作台。
          </p>
        )}
      </div>

      <fieldset className="launcher-fieldset">
        <legend>Dimension &amp; Workspace</legend>
        <div className="launcher-segmented" role="group" aria-label="工作区">
          <button
            type="button"
            className={meshing ? 'active' : ''}
            aria-pressed={meshing}
            onClick={() => setMode('meshing')}
          >
            <FluentIcon name="mesh" />
            <strong>Meshing</strong>
            <small>Watertight / Fault-Tolerant 网格</small>
          </button>
          <button
            type="button"
            className={!meshing ? 'active' : ''}
            aria-pressed={!meshing}
            onClick={() => setMode('solution')}
          >
            <FluentIcon name="contour" />
            <strong>Solution</strong>
            <small>物理模型、求解与后处理</small>
          </button>
        </div>

        <div className="launcher-options-grid">
          <div className="launcher-field">
            <span className="launcher-label">Dimension</span>
            <div className="launcher-pills" role="group" aria-label="维度选择">
              {(['3d', '2d'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={dimension === value ? 'active' : ''}
                  aria-pressed={dimension === value}
                  onClick={() => setDimension(value)}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <label className="launcher-field">
            <span className="launcher-label">
              {meshing ? 'Meshing Processes' : 'Solver Processes'}
            </span>
            <input
              type="number"
              min="1"
              max="64"
              step="1"
              value={processInput}
              disabled={prefs.parallelMode === 'serial'}
              aria-invalid={!validProcesses}
              aria-describedby={validProcesses ? undefined : 'launcher-process-error'}
              onChange={(event) => setProcessInput(event.target.value)}
            />
          </label>

          {meshing && (
            <p className="launcher-process-note" aria-live="polite">
              Solver Processes <strong>{validProcesses ? processes : '—'}</strong>
              <small>Windows 下从 Meshing 切换至 Solution 沿用相同进程数</small>
            </p>
          )}
          {!validProcesses && (
            <p className="launcher-process-error" id="launcher-process-error" role="alert">
              请输入 1 至 64 之间的整数。
            </p>
          )}
        </div>

        <label className="launcher-checkbox">
          <input
            type="checkbox"
            checked={doublePrecision}
            disabled={meshing}
            onChange={(event) => setSolutionDoublePrecision(event.target.checked)}
          />
          <span>
            Double Precision
            {meshing && <small>Meshing 固定使用双精度</small>}
          </span>
        </label>
      </fieldset>

      <fieldset className="launcher-fieldset">
        <legend>Display Options &amp; Working Directory</legend>
        <div className="launcher-display-grid">
          <label className="launcher-inline-check">
            <input
              type="checkbox"
              checked={prefs.displayMeshAfterReading}
              onChange={(event) =>
                updatePrefs('displayMeshAfterReading', event.target.checked)
              }
            />
            <span>Display Mesh After Reading</span>
          </label>

          <label className="launcher-field">
            <span className="launcher-label">Workbench Color Scheme</span>
            <select
              aria-label="Workbench Color Scheme"
              value={prefs.theme}
              onChange={(event) =>
                updatePrefs('theme', event.target.value as 'light' | 'dark')
              }
            >
              <option value="light">Workbench Light (默认亮色)</option>
              <option value="dark">Classic Dark (经典暗色)</option>
            </select>
          </label>

          <label className="launcher-field">
            <span className="launcher-label">Graphics Driver</span>
            <select
              aria-label="Graphics Driver"
              value={prefs.graphicsDriver}
              onChange={(event) =>
                updatePrefs(
                  'graphicsDriver',
                  event.target.value as FluentLauncherPreferences['graphicsDriver'],
                )
              }
            >
              <option value="auto">Auto</option>
              <option value="dx11">DirectX 11 (dx11)</option>
              <option value="opengl2">OpenGL2 (opengl2)</option>
              <option value="null">Null (Batch)</option>
            </select>
          </label>

          <label className="launcher-field launcher-field-wide">
            <span className="launcher-label">Working Directory</span>
            <input
              type="text"
              aria-label="Working Directory"
              value={prefs.workingDirectory}
              onChange={(event) => updatePrefs('workingDirectory', event.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <div className="launcher-more-toggle-row">
        <button
          type="button"
          className="launcher-more-btn"
          aria-expanded={showMoreOptions}
          onClick={() => setShowMoreOptions((prev) => !prev)}
        >
          {showMoreOptions ? 'Hide More Options <<' : 'Show More Options >>'}
        </button>
        <small>含 General / Parallel / Environment / Scheduler 选项卡</small>
      </div>

      {showMoreOptions && (
        <div className="launcher-more-panel">
          <div className="launcher-more-tabs" role="tablist" aria-label="Launcher More Options">
            {moreTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={moreTab === tab.id}
                className={moreTab === tab.id ? 'active' : ''}
                onClick={() => setMoreTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="launcher-more-body" role="tabpanel">
            {moreTab === 'general' && (
              <div className="launcher-tab-grid">
                <label className="launcher-field">
                  <span className="launcher-label">Startup Workflow (Meshing)</span>
                  <select
                    aria-label="Startup Workflow"
                    value={prefs.startupWorkflow}
                    onChange={(event) =>
                      updatePrefs(
                        'startupWorkflow',
                        event.target.value as 'watertight' | 'fault-tolerant',
                      )
                    }
                  >
                    <option value="watertight">Watertight Geometry</option>
                    <option value="fault-tolerant">Fault-Tolerant Meshing</option>
                  </select>
                </label>
                <label className="launcher-field">
                  <span className="launcher-label">Interface Language</span>
                  <select
                    aria-label="Interface Language"
                    value={prefs.language}
                    onChange={(event) =>
                      updatePrefs(
                        'language',
                        event.target.value as FluentLauncherPreferences['language'],
                      )
                    }
                  >
                    <option value="en">English</option>
                    <option value="both">双语 (English · 中文)</option>
                    <option value="zh">简体中文</option>
                  </select>
                </label>
                <label className="launcher-field launcher-field-wide">
                  <span className="launcher-label">Startup Journal / Script</span>
                  <input
                    type="text"
                    placeholder="可选，例如 setup_case.jou"
                    value={prefs.startupJournal}
                    onChange={(event) => updatePrefs('startupJournal', event.target.value)}
                  />
                </label>
              </div>
            )}

            {moreTab === 'parallel' && (
              <div className="launcher-tab-grid">
                <label className="launcher-field">
                  <span className="launcher-label">Processing Options</span>
                  <select
                    aria-label="Processing Options"
                    value={prefs.parallelMode}
                    onChange={(event) =>
                      updatePrefs(
                        'parallelMode',
                        event.target.value as FluentLauncherPreferences['parallelMode'],
                      )
                    }
                  >
                    <option value="local">Local Machine (Shared Memory / MPI)</option>
                    <option value="serial">Serial (单核串行)</option>
                    <option value="cluster">Distributed Memory on a Cluster</option>
                  </select>
                </label>
                <label className="launcher-field">
                  <span className="launcher-label">Interconnect</span>
                  <select
                    aria-label="Interconnect"
                    value={prefs.interconnect}
                    disabled={prefs.parallelMode === 'serial'}
                    onChange={(event) =>
                      updatePrefs(
                        'interconnect',
                        event.target.value as FluentLauncherPreferences['interconnect'],
                      )
                    }
                  >
                    <option value="default">default</option>
                    <option value="msmpi">msmpi</option>
                    <option value="intel">intel</option>
                  </select>
                </label>
                <label className="launcher-field">
                  <span className="launcher-label">GPGPUs per Machine</span>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    aria-label="GPGPUs per Machine"
                    value={prefs.gpgpus}
                    onChange={(event) =>
                      updatePrefs('gpgpus', Math.max(0, Math.min(8, Number(event.target.value) || 0)))
                    }
                  />
                </label>
              </div>
            )}

            {moreTab === 'environment' && (
              <div className="launcher-tab-grid">
                <label className="launcher-inline-check launcher-field-wide">
                  <input
                    type="checkbox"
                    checked={prefs.setupUdfCompiler}
                    onChange={(event) => updatePrefs('setupUdfCompiler', event.target.checked)}
                  />
                  <span>Setup Compilation Environment for UDF (MSVC / Clang)</span>
                </label>
                <label className="launcher-field launcher-field-wide">
                  <span className="launcher-label">Environment Variables</span>
                  <input
                    type="text"
                    aria-label="Environment Variables"
                    value={prefs.environmentVars}
                    onChange={(event) => updatePrefs('environmentVars', event.target.value)}
                  />
                </label>
              </div>
            )}

            {moreTab === 'scheduler' && (
              <div className="launcher-tab-grid">
                <label className="launcher-inline-check launcher-field-wide">
                  <input
                    type="checkbox"
                    checked={prefs.useScheduler}
                    onChange={(event) => updatePrefs('useScheduler', event.target.checked)}
                  />
                  <span>Use Job Scheduler</span>
                </label>
                {prefs.useScheduler && (
                  <>
                    <label className="launcher-field">
                      <span className="launcher-label">Scheduler Type</span>
                      <select
                        aria-label="Scheduler Type"
                        value={prefs.schedulerType}
                        onChange={(event) =>
                          updatePrefs(
                            'schedulerType',
                            event.target.value as FluentLauncherPreferences['schedulerType'],
                          )
                        }
                      >
                        <option value="Windows HPC">Windows HPC</option>
                        <option value="Slurm">Slurm</option>
                        <option value="LSF">LSF</option>
                        <option value="PBS">PBS</option>
                      </select>
                    </label>
                    <label className="launcher-field">
                      <span className="launcher-label">Queue Name</span>
                      <input
                        type="text"
                        aria-label="Queue Name"
                        value={prefs.schedulerQueue}
                        onChange={(event) => updatePrefs('schedulerQueue', event.target.value)}
                      />
                    </label>
                  </>
                )}
              </div>
            )}

            {moreTab === 'solver-summary' && (
              <div className="launcher-summary-note">
                <p>
                  <strong>当前启动规则：</strong>
                  {meshing
                    ? 'Meshing 固定双精度（dp）；Windows 从 Meshing 切换至 Solution 自动延续进程数。'
                    : 'Solution 支持单精度（sp，内存更省）或双精度（dp，辐射/燃烧/大长宽比网格推荐）。'}
                </p>
                <code>{cliPreview}</code>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="launcher-footer">
        <code>{`[${dimension}, ${doublePrecision ? 'dp' : 'sp'}, ${mode}, np=${validProcesses ? processes : '—'}]`}</code>
        {canLaunch ? (
          <Link className="button-link" to={launchTo} onClick={handleLaunch}>
            {startLabel}
          </Link>
        ) : (
          <button className="button-link" type="button" disabled>
            {startLabel}
          </button>
        )}
      </div>
    </aside>
  )
}
