import { FileCheck2, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { CaseLookup } from '../components/CaseLookup'
import { WorkflowProgress } from '../components/WorkflowProgress'
import { useWearline } from '../context/WearlineContext'
import { sha256File } from '../lib/hash'

export function CasePage() {
  const wearline = useWearline()
  const current = wearline.caseData
  const loaded = Boolean(current && current.id === wearline.caseId)

  return <section className="page section-pad">
    <div className="page-heading">
      <span className="kicker">Remediation case</span>
      <h1>Freeze the requirement before completion is verified.</h1>
      <p>The requester records the original defect, binds baseline evidence by SHA-256, states the exact remediation requirement, and seals the case before completion evidence can be submitted.</p>
    </div>

    <CaseLookup/>

    {loaded && current ? <>
      <section className="surface case-summary">
        <div>
          <span className="muted-label">Case #{current.id}</span>
          <h2>{current.title}</h2>
          <div className="address-grid">
            <div><span>Requester</span><code>{current.requester}</code></div>
            <div><span>Remediator</span><code>{current.remediator}</code></div>
          </div>
        </div>
        <span className="status-pill">{current.status.replaceAll('_', ' ')}</span>
      </section>

      <section className="surface">
        <WorkflowProgress/>
        <div className="rule-grid">
          <article><LockKeyhole/><span>Case state</span><strong>{current.status.replaceAll('_', ' ')}</strong><small>{current.sealed ? 'Requirements frozen' : 'Still editable by requester'}</small></article>
          <article><FileCheck2/><span>Items</span><strong>{current.item_count}</strong><small>Each item has one frozen requirement</small></article>
          <article><ShieldCheck/><span>Verified</span><strong>{current.verified_count} / {current.item_count}</strong><small>Closed verdict vocabulary</small></article>
          <article><UserRound/><span>Case result</span><strong>{current.result ? current.result.replaceAll('_', ' ') : 'Pending'}</strong><small>Derived only after every item is verified</small></article>
        </div>
      </section>

      <section className="surface">
        <div className="section-title"><div><span className="kicker">Frozen scope</span><h2>Remediation items</h2></div></div>
        {wearline.items.length ? <div className="item-list">{wearline.items.map((item) => <article key={item.index}>
          <span className="item-number">{String(item.index + 1).padStart(2, '0')}</span>
          <div>
            <strong>{item.label}</strong>
            <p>{item.defect_description}</p>
            <small>{item.remediation_requirement}</small>
            <code title={item.baseline_sha256}>sha256 · {item.baseline_sha256.slice(0, 16)}…</code>
          </div>
          <span>{item.verified ? item.verdict.replaceAll('_', ' ') : 'Pending'}</span>
        </article>)}</div> : <div className="empty-state">No remediation items yet.</div>}
      </section>

      {wearline.requesterRole && current.status === 'DRAFT' && <section className="surface">
        <div className="section-title"><div><span className="kicker">Requester action</span><h2>Freeze this case</h2></div></div>
        <p className="support-copy">Sealing makes every registered baseline, digest, defect description and remediation requirement immutable.</p>
        <div className="workflow-actions">
          <button
            className="primary-button"
            disabled={wearline.busy || !wearline.items.length}
            onClick={() => void wearline.transact('seal_case', [wearline.caseId]).catch((cause) => wearline.setError(cause instanceof Error ? cause.message : String(cause)))}
          >Seal case</button>
        </div>
      </section>}
    </> : <div className="empty-state large">{wearline.live ? 'Connect a StudioNet wallet and load a case, or create a new one below.' : 'The new contract is ready in code, but a fresh StudioNet deployment is still pending.'}</div>}

    {!loaded && <form className="surface action-card" onSubmit={wearline.createCase}>
      <div className="form-intro">
        <span className="kicker">Create on chain</span>
        <h2>New remediation case</h2>
        <p>Define the remediator and a clear title/reference. Requirements are added item by item before sealing.</p>
      </div>
      <div className="form-grid">
        <label>Case title / reference<input required minLength={3} maxLength={120} value={wearline.title} onChange={(event) => wearline.setTitle(event.target.value)}/></label>
        <label>Remediator address<input required value={wearline.remediator} onChange={(event) => wearline.setRemediator(event.target.value)} placeholder="0x…"/></label>
      </div>
      <div className="form-actions"><button className="primary-button" disabled={wearline.busy || !wearline.client || !wearline.live}>{wearline.busy ? 'Transaction pending…' : 'Create case'}</button></div>
    </form>}

    {loaded && current && wearline.requesterRole && current.status === 'DRAFT' && <form className="surface action-card" onSubmit={wearline.addItem}>
      <div className="form-intro"><span className="kicker">Freeze a requirement</span><h2>Add remediation item</h2><p>Bind the original defect evidence and state only the completion condition that GenLayer should later verify.</p></div>
      <div className="form-grid">
        <label>Item label<input required minLength={2} maxLength={120} value={wearline.label} onChange={(event) => wearline.setLabel(event.target.value)}/></label>
        <label className="wide">Documented defect<textarea required minLength={8} maxLength={600} value={wearline.defect} onChange={(event) => wearline.setDefect(event.target.value)}/></label>
        <label className="wide">Baseline HTTPS URL<input required type="url" value={wearline.baselineUrl} onChange={(event) => wearline.setBaselineUrl(event.target.value)} placeholder="https://…"/></label>
        <label className="wide">Baseline SHA-256<input required value={wearline.baselineHash} onChange={(event) => wearline.setBaselineHash(event.target.value)} placeholder="64 hexadecimal characters"/></label>
        <label className="wide">Exact remediation requirement<textarea required minLength={8} maxLength={800} value={wearline.requirement} onChange={(event) => wearline.setRequirement(event.target.value)} placeholder="The completed work must…"/></label>
      </div>
      <div className="workflow-actions">
        <button type="button" className="secondary-button" disabled={!wearline.baselineUrl} onClick={() => void wearline.hashUrl(wearline.baselineUrl, wearline.setBaselineHash)}>Hash URL bytes</button>
        <label className="file-button">Hash local image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (file) wearline.setBaselineHash(await sha256File(file)) }}/></label>
        <button className="primary-button" disabled={wearline.busy || !wearline.client}>{wearline.busy ? 'Transaction pending…' : 'Add item'}</button>
      </div>
    </form>}
  </section>
}
