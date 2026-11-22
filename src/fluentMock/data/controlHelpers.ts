import type { FluentMockControl } from '../fluentTypes'

const pendingCommands = new Set<string>([])

export type ControlInput = Omit<
  FluentMockControl,
  'enabled' | 'explanationId' | 'label' | 'labelZh'
> & {
  label: string
  labelZh?: string
  enabled?: boolean
  explanationId?: string
}

export function makeControl(input: ControlInput): FluentMockControl {
  const unavailableReason = input.unavailableReason ??
    (pendingCommands.has(input.id) ? 'This command is pending in the teaching workbench.' : undefined)
  return {
    ...input,
    labelZh: input.labelZh ?? input.label,
    enabled: !unavailableReason && (input.enabled ?? true),
    unavailableReason,
    explanationId: input.explanationId ?? `${input.id}-explanation`,
  }
}

export function makeRibbonControl(
  id: string,
  label: string,
  group: string,
  dialogId?: string,
  options: Partial<FluentMockControl> = {},
): FluentMockControl {
  return makeControl({
    id,
    label,
    region: 'Ribbon 菜单',
    module: options.module ?? 'Mesh',
    group,
    controlType: 'ribbon-button',
    dialogId,
    ...options,
  })
}

export function makePanelControl(
  id: string,
  label: string,
  module: string,
  group: string,
  controlType: FluentMockControl['controlType'] = 'button',
  options: Partial<FluentMockControl> = {},
): FluentMockControl {
  return makeControl({
    id,
    label,
    region: '任务页面',
    module,
    group,
    controlType,
    ...options,
  })
}
