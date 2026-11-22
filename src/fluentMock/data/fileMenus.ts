import type { FluentMockControl, FluentMockDialog } from '../fluentTypes'
import { makeControl, makeRibbonControl, type ControlInput } from './controlHelpers'

type FileOperation = NonNullable<FluentMockDialog['fileOperation']>
const fileDialogs: FluentMockDialog[] = []

function fileCommand(
  verb: FileOperation['verb'],
  id: string,
  format: string,
  extensions: string[],
  sessionKey?: FileOperation['sessionKey'],
) {
  const dialogId = id + '-dialog'
  const title = verb + ' ' + format
  fileDialogs.push({
    id: dialogId,
    title,
    module: 'File',
    subtitle: '文件路径仅用于教学演示。确认后可在 Console 查看当前命令的执行结果。',
    fileOperation: { verb, format, extensions, sessionKey },
    controls: [
      makeControl({
        id: id + '-path',
        label: 'File Name',
        module: 'File',
        region: '模拟窗口',
        group: title,
        controlType: 'field',
        parentId: dialogId,
      }),
    ],
  })
  return makeRibbonControl(id, format + '…', verb, dialogId, { module: 'File' })
}

function menu(id: string, label: string, children: FluentMockControl[]) {
  return makeRibbonControl(id, label, 'File', undefined, {
    module: 'File',
    children,
  })
}

const mesh = ['.msh.h5', '.msh', '.msh.gz']
const cas = ['.cas.h5', '.cas', '.cas.gz']
const dat = ['.dat.h5', '.dat', '.dat.gz']
const profile = ['.prof', '.prof.gz']
export const replaceMeshOption = 'Discard Data, Replace Mesh'
export const newMeshOption = 'Discard Case And Data, Read New Mesh'
const readMesh = fileCommand('Read', 'ribbon-read-mesh', 'Mesh', mesh, 'mesh')
const readMeshDialog = fileDialogs.at(-1)!
readMeshDialog.controls.push(...[
  makeControl({
    id: 'read-mesh-mode', label: 'Read Mesh Options', region: '模拟窗口',
    module: 'File', group: 'Options', parentId: readMeshDialog.id,
    controlType: 'select', value: newMeshOption, options: [newMeshOption, replaceMeshOption],
  }),
  makeControl({
    id: 'read-mesh-show-scale', label: 'Show Scale Mesh Panel After Replacing Mesh',
    region: '模拟窗口', module: 'File', group: 'Options', parentId: readMeshDialog.id,
    controlType: 'checkbox', visibleWhen: [{ controlId: 'read-mesh-mode', values: [replaceMeshOption] }],
  }),
])

function recordingCommand(kind: 'journal' | 'transcript', extension: string) {
  const name = kind === 'journal' ? 'Journal' : 'Transcript'
  const start = fileCommand('Write', 'ribbon-write-' + kind, 'Start ' + name, [extension])
  start.visibleWhen = [{ controlId: start.id, values: [false] }]
  return [start, makeRibbonControl('ribbon-stop-' + kind, 'Stop ' + name, 'Write', undefined, {
    module: 'File', visibleWhen: [{ controlId: start.id, values: [true] }],
  })]
}

export const solutionFileMenus = [
  menu('ribbon-file-read-menu', 'Read', [
    readMesh,
    fileCommand('Read', 'ribbon-read-case', 'Case', cas, 'case'),
    fileCommand('Read', 'ribbon-read-data', 'Data', dat, 'data'),
    fileCommand('Read', 'ribbon-read-case-data', 'Case & Data', cas, 'case-data'),
    fileCommand('Read', 'ribbon-read-case-settings', 'Case Settings Only', cas),
    fileCommand('Read', 'ribbon-read-case-info', 'Case/Mesh Info', [...cas, ...mesh]),
    fileCommand('Read', 'ribbon-read-profile', 'Profile', profile),
    fileCommand('Read', 'ribbon-read-scheme', 'Scheme', ['.scm']),
    fileCommand('Read', 'ribbon-read-journal', 'Journal', ['.jou']),
  ]),
  menu('ribbon-file-write-menu', 'Write', [
    fileCommand('Write', 'ribbon-write-case', 'Case', cas, 'case'),
    fileCommand('Write', 'ribbon-write-data', 'Data', dat, 'data'),
    fileCommand('Write', 'ribbon-write-case-data', 'Case & Data', cas, 'case-data'),
    fileCommand('Write', 'ribbon-write-profile', 'Profile', profile),
    makeRibbonControl('ribbon-write-autosave', 'Autosave…', 'Write', 'autosave-dialog', { module: 'File' }),
    fileCommand('Write', 'ribbon-write-boundary-mesh', 'Boundary Mesh', mesh),
    ...recordingCommand('journal', '.jou'),
    ...recordingCommand('transcript', '.trn'),
  ]),
  menu('ribbon-import', 'Import', [
    menu('ribbon-import-abaqus', 'ABAQUS', [
      fileCommand('Import', 'ribbon-import-abaqus-input', 'Input File', ['.inp']),
      fileCommand('Import', 'ribbon-import-abaqus-results', 'ODB File', ['.odb']),
    ]),
    menu('ribbon-import-cfx', 'CFX', [
      fileCommand('Import', 'ribbon-import-cfx-definition', 'Definition File', ['.def']),
      fileCommand('Import', 'ribbon-import-cfx-results', 'Result File', ['.res']),
    ]),
    menu('ribbon-import-cgns', 'CGNS', [
      fileCommand('Import', 'ribbon-import-cgns-mesh', 'Mesh', ['.cgns'], 'mesh'),
      fileCommand('Import', 'ribbon-import-cgns-data', 'Data', ['.cgns'], 'data'),
      fileCommand('Import', 'ribbon-import-cgns-both', 'Mesh & Data', ['.cgns'], 'mesh-data'),
    ]),
    menu('ribbon-import-nastran', 'NASTRAN', [
      fileCommand('Import', 'ribbon-import-nastran-bulkdata', 'Bulkdata File', ['.bdf', '.nas', '.dat']),
      fileCommand('Import', 'ribbon-import-nastran-op2', 'Op2 File', ['.op2']),
    ]),
    fileCommand('Import', 'ribbon-import-ensight', 'EnSight', ['.case']),
    fileCommand('Import', 'ribbon-import-tecplot', 'Tecplot', ['.dat', '.plt']),
    fileCommand('Import', 'ribbon-import-fmu', 'FMU', ['.fmu']),
  ]),
  menu('ribbon-export', 'Export', [
    makeRibbonControl('ribbon-export-solution', 'Solution Data…', 'Export', 'export-solution-dialog', { module: 'File' }),
    makeRibbonControl('ribbon-export-particles', 'Particle History Data…', 'Export', 'export-particles-dialog', { module: 'File' }),
    { ...menu('ribbon-export-during', 'During Calculation', [
      makeRibbonControl('ribbon-export-during-solution', 'Solution Data…', 'During Calculation', 'export-solution-during-dialog', { module: 'File' }),
      makeRibbonControl('ribbon-export-during-particles', 'Particle History Data…', 'During Calculation', 'export-particles-during-dialog', { module: 'File' }),
    ]), visibleWhen: [{ controlId: 'solver-time-formulation', values: ['Transient'] }] },
  ]),
]

const exportDialogs = [
  ['export-solution-dialog', 'Export Solution Data', false, false],
  ['export-particles-dialog', 'Export Particle History Data', false, true],
  ['export-solution-during-dialog', 'Export Solution Data During Calculation', true, false],
  ['export-particles-during-dialog', 'Export Particle History Data During Calculation', true, true],
] as const

for (const [id, title, scheduled, particle] of exportDialogs) {
  const format = id + '-format'
  const fields: Array<Pick<ControlInput, 'id' | 'label' | 'controlType' | 'options' | 'value' | 'visibleWhen'>> = [
    { id: id + '-path', label: scheduled ? 'File Name Root' : 'File Name', controlType: 'field' },
    { id: format, label: 'File Type', controlType: 'select', value: 'ASCII', options: particle ? ['ASCII'] : ['ASCII', 'CGNS', 'EnSight', 'Tecplot'] },
    particle
      ? { id: id + '-injection', label: 'Injection', controlType: 'select', value: 'injection-1', options: ['injection-1', 'all-injections'] }
      : { id: id + '-surface', label: 'Surfaces', controlType: 'select', value: 'wall', options: ['wall', 'inlet', 'outlet', 'all-surfaces'] },
    ...(particle ? [] : [{
      id: id + '-quantities', label: 'Quantities', controlType: 'select' as const,
      value: 'Velocity Magnitude', options: ['Velocity Magnitude', 'Static Pressure', 'Static Temperature'],
    }]),
  ]
  if (scheduled) fields.push(
    { id: id + '-frequency', label: 'Export Every', controlType: 'field', value: '10' },
    { id: id + '-interval', label: 'Frequency Type', controlType: 'select', value: 'Time Steps', options: ['Time Steps'] },
  )
  fileDialogs.push({
    id,
    title,
    module: 'File',
    subtitle: scheduled ? '设置周期性导出的文件根名和输出间隔。' : '选择文件格式、输出表面和变量。',
    fileOperation: { verb: 'Export', format: particle ? 'Particle History Data' : 'Solution Data', extensions: [] },
    controls: fields.map((field) => makeControl({
      ...field, region: '模拟窗口', group: title, module: 'File', parentId: id,
    })),
  })
}

export { fileDialogs }
