import { makeControl, makeRibbonControl } from './controlHelpers'
import type { FluentMockControl, FluentMockDialog } from '../fluentTypes'

export const surfaceKinds = [
  ['point-surface', 'Point Surface'],
  ['line-rake', 'Line/Rake'],
  ['plane-surface', 'Plane Surface'],
  ['iso-surface', 'Iso-Surface'],
  ['iso-clip', 'Iso-Clip'],
] as const

export const surfaceMenu = makeRibbonControl(
  'ribbon-surface-create', '创建表面', '表面', undefined,
  {
    module: 'Results',
    children: surfaceKinds.map(([id, title]) => makeRibbonControl(
      'ribbon-create-' + id, title, '表面', id + '-dialog',
      { module: 'Results', panelId: 'surfaces-panel' },
    )),
  },
)

function resultControl(
  prefix: string,
  suffix: string,
  label: string,
  value?: string,
  options?: string[],
  visibleWhen?: FluentMockControl['visibleWhen'],
) {
  return makeControl({
    id: prefix + '-' + suffix,
    parentId: prefix + '-dialog',
    region: '模拟窗口',
    module: 'Results',
    group: prefix,
    label,
    value,
    options,
    visibleWhen,
    controlType: options ? 'select' : value !== undefined ? 'field' : 'button',
  })
}

const point = (prefix: string, suffix: string, label: string, offset = '0') => (
  ['X', 'Y', 'Z'].map((axis, i) => resultControl(prefix, suffix + '-' + axis.toLowerCase(), label + ' ' + axis, i === 0 ? offset : '0'))
)

export const surfaceChildDialogs: FluentMockDialog[] = [
  {
    id: 'point-surface-dialog',
    title: 'Point Surface',
    module: 'Results',
    subtitle: '用坐标定义一个取样点。',
    controls: point('point-surface', 'point', 'Point'),
  },
  {
    id: 'line-rake-dialog',
    title: 'Line/Rake',
    module: 'Results',
    subtitle: '指定起点和终点。选择 Rake 时可指定采样点数。',
    controls: [
      resultControl('line-rake', 'type', 'Type', 'Line', ['Line', 'Rake']),
      ...point('line-rake', 'start', 'Start'),
      ...point('line-rake', 'end', 'End', '0.1'),
      resultControl('line-rake', 'points', 'Number of Points', '10', undefined, [
        { controlId: 'line-rake-type', values: ['Rake'] },
      ]),
    ],
  },
  {
    id: 'iso-clip-dialog',
    title: 'Iso-Clip',
    module: 'Results',
    subtitle: '按变量范围裁剪所选表面。',
    controls: [
      resultControl('iso-clip', 'surface', 'Clip Surface', 'wall', ['wall', 'inlet', 'outlet']),
      resultControl('iso-clip', 'field', 'Clip to Values of', 'Velocity Magnitude', ['Velocity Magnitude', 'Static Pressure', 'Static Temperature']),
      resultControl('iso-clip', 'minimum', 'Min', '0'),
      resultControl('iso-clip', 'maximum', 'Max', '10'),
    ],
  },
  {
    id: 'particle-tracks-dialog',
    title: 'Particle Tracks',
    module: 'Results',
    subtitle: '选择示例颗粒注入和轨迹着色变量。',
    controls: [
      resultControl('particle-tracks', 'injection', 'Injection', 'injection-1', ['injection-1', 'injection-2']),
      resultControl('particle-tracks', 'color-by', 'Color by', 'Particle Velocity', ['Particle Velocity', 'Particle Residence Time']),
      resultControl('particle-tracks', 'display', 'Display'),
    ],
  },
]

export function addResultBranches(dialog: FluentMockDialog): FluentMockDialog {
  const prefix = dialog.id.replace(/-dialog$/, '')
  if (surfaceKinds.some(([id]) => id === prefix)) {
    const name = resultControl(prefix, 'name', 'New Surface Name', prefix + '-1')
    const controls = dialog.controls.map((control) => {
      if (['plane-surface-point', 'plane-surface-normal'].includes(control.id)) {
        return { ...control, visibleWhen: [{ controlId: 'plane-surface-method', values: ['Point and Normal'] }] }
      }
      return control
    })
    const create = controls.find((control) => control.id === prefix + '-create') ??
      resultControl(prefix, 'create', 'Create')
    if (prefix === 'plane-surface') {
      controls.push(resultControl(prefix, 'coordinate', 'Plane Coordinate', '0', undefined, [
        { controlId: 'plane-surface-method', values: ['YZ Plane', 'XZ Plane', 'XY Plane'] },
      ]))
    }
    return { ...dialog, controls: [name, ...controls.filter((control) => control !== create), create] }
  }
  if (prefix === 'contours' || prefix === 'vectors') {
    return {
      ...dialog,
      controls: [...dialog.controls, resultControl(prefix, 'display', 'Display')],
    }
  }
  return dialog
}
