import type { Dispatch } from 'react'
import type { FluentMeshingAction, FluentMeshingState } from './meshingState'

export function MultizoneTaskBody({ state, dispatch }: {
  state: FluentMeshingState
  dispatch: Dispatch<FluentMeshingAction>
}) {
  const { form, controls, selected, nonConformal, qualityLimit, scaleFactor } = state.multizone
  const regions = state.regions.filter((region) => region.type !== 'dead')
  const editForm = (patch: Partial<typeof form>) =>
    dispatch({ type: 'UPDATE_MULTIZONE', patch: { form: { ...form, ...patch } } })

  if (state.activeTaskId === 'wm-multizone-controls') {
    return (
      <div className="fluent-controls-stack">
        <fieldset className="fluent-task-group">
          <legend>Multizone Controls and Sizing</legend>
          <label className="fluent-field-row">
            <span>Region</span>
            <select value={form.regionId} onChange={(event) => {
              const regionId = event.target.value
              editForm(controls[regionId] ?? { regionId, method: 'Standard', fill: 'Hex-Pave', sweepSize: '' })
            }}>
              <option value="">Select a region…</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </label>
          <label className="fluent-field-row">
            <span>Mesh Method</span>
            <select value={form.method} onChange={(event) => {
              const method = event.target.value as typeof form.method
              editForm({ method, fill: method === 'Thin' && (form.fill === 'Prism' || form.fill === 'Mixed') ? 'Hex-Pave' : form.fill })
            }}>
              <option>Standard</option>
              <option>Thin</option>
            </select>
          </label>
          <label className="fluent-field-row">
            <span>Fill With</span>
            <select value={form.fill} onChange={(event) => editForm({ fill: event.target.value as typeof form.fill })}>
              <option>Hex-Pave</option>
              <option>Hex-Map</option>
              {form.method === 'Standard' && <option>Prism</option>}
              {form.method === 'Standard' && <option>Mixed</option>}
            </select>
          </label>
          <label className="fluent-field-row">
            <span>Max Sweep Size</span>
            <input inputMode="decimal" value={form.sweepSize} onChange={(event) => editForm({ sweepSize: event.target.value })} />
          </label>
        </fieldset>
        <div className="fluent-task-footer-actions">
          <button type="button" className="fluent-primary-btn" onClick={() => dispatch({ type: 'SAVE_MULTIZONE_CONTROL' })}>
            {controls[form.regionId] ? 'Update Multizone Control' : 'Add Multizone Controls'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fluent-controls-stack">
      <fieldset className="fluent-task-group">
        <legend>Regions with Multizone Controls</legend>
        {regions.filter((region) => controls[region.id]).map((region) => (
          <label className="fluent-choice-row" key={region.id}>
            <input type="checkbox" checked={selected.includes(region.id)} onChange={(event) => dispatch({
              type: 'UPDATE_MULTIZONE',
              patch: { selected: event.target.checked ? [...selected, region.id] : selected.filter((id) => id !== region.id) },
            })} />
            <span>{region.name}</span>
          </label>
        ))}
        <label className="fluent-field-row">
          <span>Quality Improve Limit</span>
          <input inputMode="decimal" value={qualityLimit} onChange={(event) => dispatch({ type: 'UPDATE_MULTIZONE', patch: { qualityLimit: event.target.value } })} />
        </label>
        <label className="fluent-choice-row">
          <input type="checkbox" checked={nonConformal} onChange={(event) => dispatch({ type: 'UPDATE_MULTIZONE', patch: { nonConformal: event.target.checked } })} />
          <span>Non-Conformal Mesh between Multizone and the rest?</span>
        </label>
        {!nonConformal && <label className="fluent-field-row">
          <span>Size Function Scale Factor</span>
          <input inputMode="decimal" value={scaleFactor} onChange={(event) => dispatch({ type: 'UPDATE_MULTIZONE', patch: { scaleFactor: event.target.value } })} />
        </label>}
      </fieldset>
      <div className="fluent-task-footer-actions">
        <button type="button" className="fluent-primary-btn" onClick={() => dispatch({ type: 'RUN_MULTIZONE_MESH' })}>
          Generate the Multizone Mesh
        </button>
      </div>
    </div>
  )
}
