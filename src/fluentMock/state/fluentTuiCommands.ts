import type { FluentSimAction, FluentSimState } from './fluentSimState'

export const tuiPresetCommands = [
  '/mesh/check',
  '/mesh/quality',
  '/solve/initialize/hyb-initialization',
  '/solve/iterate 50',
  'help',
  'clear',
] as const

export function parseAndExecuteTui(
  rawCommand: string,
  state: FluentSimState,
): FluentSimAction {
  const command = rawCommand.trim()
  const normalized = command.toLowerCase()

  if (!command) {
    return {
      type: 'APPEND_CONSOLE',
      entries: [{ kind: 'info', text: '> ' }],
    }
  }

  if (normalized === 'clear' || normalized === 'cls') {
    return { type: 'CLEAR_CONSOLE' }
  }

  if (normalized === 'help' || normalized === '?') {
    return {
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> ${command}` },
        {
          kind: 'info',
          text: 'Available Teaching TUI commands: /mesh/check | /mesh/quality | /define/models/energy | /solve/initialize/hyb-initialization | /solve/iterate <n> | clear',
        },
      ],
    }
  }

  if (normalized === '/mesh/check' || normalized === 'mesh check') {
    return { type: 'RUN_MESH_CHECK' }
  }

  if (normalized === '/mesh/quality' || normalized === 'mesh quality') {
    return { type: 'RUN_MESH_QUALITY' }
  }

  if (normalized.startsWith('/define/models/energy')) {
    return { type: 'SET_ENERGY_ENABLED', enabled: !state.energyEnabled }
  }

  if (
    normalized.startsWith('/solve/initialize/hyb') ||
    normalized.startsWith('/solve/initialize/initialize-flow')
  ) {
    return {
      type: 'RUN_INITIALIZE',
      method: normalized.includes('hyb') ? 'hybrid' : 'standard',
    }
  }

  if (normalized.startsWith('/solve/iterate')) {
    const parts = normalized.split(/\s+/)
    const count = Number.parseInt(parts[1] ?? '', 10)
    return {
      type: 'RUN_CALCULATE',
      iterationsOverride: Number.isFinite(count) && count > 0 ? count : undefined,
    }
  }

  return {
    type: 'APPEND_CONSOLE',
    entries: [
      { kind: 'command', text: `> ${command}` },
      {
        kind: 'warning',
        text: `Unknown teaching TUI command "${command}". Type "help" to see supported commands.`,
      },
    ],
  }
}
