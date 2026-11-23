import { makeControl } from './controlHelpers'
import type { FluentMockDialog, FluentVisibilityCondition } from '../fluentTypes'

const parentId = 'dynamic-mesh-zones-dialog'
const dynamicMesh = 'Dynamic Mesh'
const typeIs = (...values: string[]): FluentVisibilityCondition[] =>
  [{ controlId: 'dynamic-mesh-zone-type', values }]
const geometryIs = (value: string): FluentVisibilityCondition[] =>
  [...typeIs('Deforming'), { controlId: 'dynamic-mesh-zone-geometry', values: [value] }]

function zoneField(
  suffix: string,
  label: string,
  value: string,
  options?: string[],
  visibleWhen?: FluentVisibilityCondition[],
  group = 'Zone Definition',
) {
  return makeControl({
    id: 'dynamic-mesh-zone-' + suffix,
    label,
    region: '模拟窗口',
    module: dynamicMesh,
    group,
    parentId,
    controlType: options ? 'select' : 'field',
    value,
    options,
    visibleWhen,
  })
}

export const dynamicMeshZonesDialog: FluentMockDialog = {
  id: parentId,
  title: 'Dynamic Mesh Zones',
  module: dynamicMesh,
  subtitle: '按网格区域记录运动或变形设置。运动预览和网格更新由 Fluent 求解器执行。',
  sharedGroups: ['Zone Definition'],
  controls: [
    zoneField('selection', 'Zone Name', 'fluid', ['fluid', 'wall', 'inlet', 'outlet']),
    zoneField('type', 'Type', 'Stationary', ['Stationary', 'Rigid Body', 'Deforming', 'User-Defined', 'System Coupling']),
    zoneField('motion', 'Motion UDF/Profile', '', undefined, typeIs('Rigid Body', 'User-Defined'), 'Motion Attributes'),
    zoneField('center', 'Center of Gravity Location', '', undefined, typeIs('Rigid Body'), 'Motion Attributes'),
    zoneField('orientation', 'Rigid Body Orientation', '', undefined, typeIs('Rigid Body'), 'Motion Attributes'),
    makeControl({
      id: 'dynamic-mesh-zone-sixdof-on',
      label: 'Six DOF Solver',
      region: '模拟窗口',
      module: dynamicMesh,
      group: 'Motion Attributes',
      parentId,
      controlType: 'checkbox',
      defaultSelected: false,
      visibleWhen: typeIs('Rigid Body'),
    }),
    makeControl({
      id: 'dynamic-mesh-zone-sixdof-passive',
      label: 'Six DOF Passive',
      region: '模拟窗口',
      module: dynamicMesh,
      group: 'Motion Attributes',
      parentId,
      controlType: 'checkbox',
      defaultSelected: false,
      visibleWhen: [...typeIs('Rigid Body'), { controlId: 'dynamic-mesh-zone-sixdof-on', values: [true] }],
    }),
    zoneField('geometry', 'Geometry Definition', 'unspecified', ['unspecified', 'faceted', 'plane', 'cylinder', 'user-defined'], typeIs('Deforming'), 'Geometry Definition'),
    zoneField('feature-angle', 'Feature Angle', '', undefined, geometryIs('faceted'), 'Geometry Definition'),
    zoneField('plane-point', 'Point on Plane', '', undefined, geometryIs('plane'), 'Geometry Definition'),
    zoneField('plane-normal', 'Plane Normal', '', undefined, geometryIs('plane'), 'Geometry Definition'),
    zoneField('cylinder-origin', 'Cylinder Origin', '', undefined, geometryIs('cylinder'), 'Geometry Definition'),
    zoneField('cylinder-axis', 'Cylinder Axis', '', undefined, geometryIs('cylinder'), 'Geometry Definition'),
    zoneField('cylinder-radius', 'Cylinder Radius', '', undefined, geometryIs('cylinder'), 'Geometry Definition'),
    zoneField('geometry-udf', 'Geometry UDF', '', undefined, geometryIs('user-defined'), 'Geometry Definition'),
    zoneField('cell-height', 'Cell Height (m)', '0.002', undefined, undefined, 'Meshing Options'),
    zoneField('remesh-min-length', 'Minimum Length Scale', '', undefined, [...typeIs('Deforming'), { controlId: 'dynamic-mesh-remeshing', values: [true] }], 'Meshing Options'),
    zoneField('remesh-max-length', 'Maximum Length Scale', '', undefined, [...typeIs('Deforming'), { controlId: 'dynamic-mesh-remeshing', values: [true] }], 'Meshing Options'),
    zoneField('max-skew', 'Maximum Cell Skewness', '0.7', undefined, [...typeIs('Deforming'), { controlId: 'dynamic-mesh-remeshing', values: [true] }], 'Meshing Options'),
  ],
}
