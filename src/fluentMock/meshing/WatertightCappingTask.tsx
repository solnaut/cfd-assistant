import type { Dispatch } from 'react'
import type { FluentMeshingAction, FluentMeshingState } from './meshingState'

const zoneTypes = ['velocity-inlet', 'pressure-outlet', 'pressure-inlet', 'pressure-far-field', 'mass-flow-inlet', 'outflow', 'symmetry', 'wall']

export function WatertightCappingTask({ state, dispatch }: {
  state: FluentMeshingState
  dispatch: Dispatch<FluentMeshingAction>
}) {
  const form = state.capping
  const update = (patch: Partial<typeof form>) => dispatch({ type: 'UPDATE_WATERTIGHT_CAP', patch })
  const openings = form.capType === 'annular'
    ? (form.selectBy === 'Label' ? ['annular-opening-label'] : ['inner / outer zones'])
    : (form.selectBy === 'Label' ? ['inlet-opening', 'outlet-opening'] : ['inlet', 'outlet'])

  return (
    <div className="fluent-controls-stack">
      <fieldset className="fluent-task-group">
        <legend>Enclose Fluid Regions</legend>
        <label className="fluent-field-row">
          <span>Name</span>
          <input value={form.name} placeholder={'cap-' + form.zoneType} onChange={(event) => update({ name: event.target.value })} />
        </label>
        <label className="fluent-field-row">
          <span>Zone Type</span>
          <select value={form.zoneType} onChange={(event) => update({ zoneType: event.target.value })}>
            {zoneTypes.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="fluent-field-row">
          <span>Cap Type</span>
          <select value={form.capType} onChange={(event) => update({ capType: event.target.value as typeof form.capType, opening: '' })}>
            <option value="single">Single Surface</option>
            <option value="annular">Annular</option>
          </select>
        </label>
        <label className="fluent-field-row">
          <span>Select By</span>
          <select value={form.selectBy} onChange={(event) => update({ selectBy: event.target.value as typeof form.selectBy, opening: '' })}>
            <option>Label</option>
            <option>Zone</option>
          </select>
        </label>
        <label className="fluent-field-row">
          <span>Opening</span>
          <select value={form.opening} onChange={(event) => update({ opening: event.target.value })}>
            <option value="">Select an opening…</option>
            {openings.map((opening) => <option key={opening}>{opening}</option>)}
          </select>
        </label>
        <details>
          <summary>Advanced Options</summary>
          <label className="fluent-choice-row">
            <input type="checkbox" checked={form.checkIntersection} onChange={(event) => update({ checkIntersection: event.target.checked })} />
            <span>Check Cap Self-Intersection?</span>
          </label>
          <label className="fluent-field-row">
            <span>Max Cap Edge Count Limit</span>
            <input inputMode="numeric" value={form.maxEdges} onChange={(event) => update({ maxEdges: event.target.value })} />
          </label>
        </details>
        {form.caps.length > 0 && (
          <ul className="fluent-task-records" aria-label="Created caps">
            {form.caps.map((cap) => <li key={cap.id}>{cap.name} · {cap.type}</li>)}
          </ul>
        )}
      </fieldset>
      <div className="fluent-task-footer-actions">
        <button type="button" onClick={() => dispatch({ type: 'ADD_WATERTIGHT_CAP' })}>Create Cap(s)</button>
        <button type="button" className="fluent-primary-btn" onClick={() => dispatch({ type: 'APPLY_WATERTIGHT_CAPS' })}>Update</button>
      </div>
    </div>
  )
}
