import { makeControl } from './controlHelpers'
import type { FluentMockDialog, FluentVisibilityCondition } from '../fluentTypes'

const parentId = 'dynamic-mesh-zones-dialog'
const dynamicMesh = 'Dynamic Mesh'
const typeIs = (...values: string[]): FluentVisibilityCondition[] =>
  [{ controlId: 'dynamic-mesh-zone-type', values }]
const geometryIs = (value: string): FluentVisibilityCondition[] =>
  [...typeIs('Deforming'), { controlId: 'dynamic-mesh-zone-geometry', values: [value] }]

export const dynamicMeshZonesDialog: FluentMockDialog = {
  id: parentId,
  title: 'Dynamic Mesh Zones',
  module: dynamicMesh,
  subtitle: '按网格区域记录运动或变形设置。运动预览和网格更新由 Fluent 求解器执行。',
  controls: [
    zoneField('selection', 'Zone Name', 'fluid', ['fluid', 'wall', 'inlet', 'outlet']),
    zoneField('type', 'Type', 'Stationary', ['Stationary', 'Rigid Body', 'Deforming', 'User-Defined', 'System Coupling']),
    zoneField('motion', 'Motion UDF/Profile', '', undefined, typeIs('Rigid Body', 'User-Defined')),
    zoneField('center', 'Center of Gravity Location', '', undefined, typeIs('Rigid Body')),
    zoneField('orientation', 'Rigid Body Orientation', '', undefined, typeIs('Rigid Body')),
    zoneField('geometry', 'Geometry Definition', 'unspecified', ['unspecified', 'faceted', 'plane', 'cylinder', 'user-defined'], typeIs('Deforming')),
    zoneField('feature-angle', 'Feature Angle', '', undefined, geometryIs('faceted')),
    zoneField('plane-point', 'Point on Plane', '', undefined, geometryIs('plane')),
    zoneField('plane-normal', 'Plane Normal', '', undefined, geometryIs('plane')),
    zoneField('cylinder-origin', 'Cylinder Origin', '', undefined, geometryIs('cylinder')),
    zoneField('cylinder-axis', 'Cylinder Axis', '', undefined, geometryIs('cylinder')),
    zoneField('cylinder-radius', 'Cylinder Radius', '', undefined, geometryIs('cylinder')),
    zoneField('geometry-udf', 'Geometry UDF', '', undefined, geometryIs('user-defined')),
    zoneField('remesh-min-length', 'Minimum Length Scale', '', undefined, [...typeIs('Deforming'), { controlId: 'dynamic-mesh-remeshing', values: [true] }]),
    zoneField('remesh-max-length', 'Maximum Length Scale', '', undefined, [...typeIs('Deforming'), { controlId: 'dynamic-mesh-remeshing', values: [true] }]),
  ],
}

function zoneField(suffix: string, label: string, value: string, options?: string[], visibleWhen?: FluentVisibilityCondition[]) {
  return makeControl({
    id: 'dynamic-mesh-zone-' + suffix,
    label,
    region: '模拟窗口',
    module: dynamicMesh,
    group: 'Zone Definition',
    parentId,
    controlType: options ? 'select' : 'field',
    value,
    options,
    visibleWhen,
  })
}
