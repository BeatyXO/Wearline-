import { CaseLookup } from '../components/CaseLookup'
import { digest, evidenceUrl, useWearline } from '../context/WearlineContext'
import { sha256File } from '../lib/hash'

function verdictClass(verdict: string) {
  return verdict ? verdict.toLowerCase().replaceAll('_', '-') : 'pending'
}

export function EvidencePage() {
  const wearline = useWearline()
  const current = wearline.caseData
  const loaded = Boolean(current && current.id === wearline.caseId)

  return <section className="page section-pad">
    <div className="page-heading">
      <span className="kicker">Evidence</span>
      <h1>Verify completion against the frozen requirement.</h1>
      <p>The baseline establishes the documented defect. The later image is judged only against the exact requirement frozen before completion.</p>
    </div>

    {!loaded && <>
      <CaseLookup/>
      <div className="empty-state large">{wearline.caseId && wearline.loading ? 'Reading case data from StudioNet…' : 'Load a case to inspect or submit completion evidence.'}</div>
    </>}

    {loaded && current && <div className="review-list">
      {wearline.items.length === 0 ? <div className="empty-state large">No remediation items are attached to this case.</div> : wearline.items.map((item) => {
        const completionUrl = wearline.completionUrls[item.index] ?? item.completion_url
        const completionHash = wearline.completionHashes[item.index] ?? item.completion_sha256
        const maySubmit = wearline.remediatorRole && !item.verified && !item.completion_url && ['SEALED', 'REVIEWING'].includes(current.status)
        const mayVerify = Boolean(wearline.client && item.completion_url && !item.verified && current.status === 'REVIEWING')
        return <article className="review-card" key={item.index}>
          <div className="review-head">
            <div><span className="item-number">{String(item.index + 1).padStart(2, '0')}</span><div><h2>{item.label}</h2><span>{item.verified ? 'Verification complete' : 'Awaiting final determination'}</span></div></div>
            <span className={`class-pill ${verdictClass(item.verdict)}`}>{item.verdict ? item.verdict.replaceAll('_', ' ') : 'PENDING'}</span>
          </div>

          <div className="requirement-card">
            <div><span>Documented defect</span><p>{item.defect_description}</p></div>
            <div><span>Frozen remediation requirement</span><p>{item.remediation_requirement}</p></div>
          </div>

          <div className="image-pair">
            <div className="evidence-image">
              <span>BEFORE REMEDIATION</span>
              <a href={item.baseline_url} target="_blank" rel="noreferrer"><img src={item.baseline_url} alt={`Baseline evidence for ${item.label}`} loading="lazy"/></a>
              <code title={item.baseline_sha256}>sha256 · {item.baseline_sha256.slice(0, 16)}…</code>
            </div>
            <div className="evidence-image">
              <span>COMPLETION EVIDENCE</span>
              {item.completion_url
                ? <a href={item.completion_url} target="_blank" rel="noreferrer"><img src={item.completion_url} alt={`Completion evidence for ${item.label}`} loading="lazy"/></a>
                : <div className="image-empty">Completion evidence has not been submitted.</div>}
              <code title={item.completion_sha256}>{item.completion_sha256 ? `sha256 · ${item.completion_sha256.slice(0, 16)}…` : 'No completion digest'}</code>
            </div>
          </div>

          <div className="verification-grid">
            <div><span>Verdict</span><strong>{item.verdict ? item.verdict.replaceAll('_', ' ') : 'Pending'}</strong></div>
            <div><span>Verified</span><strong>{item.verified ? 'Yes' : 'No'}</strong></div>
            <div><span>Case state</span><strong>{current.status.replaceAll('_', ' ')}</strong></div>
          </div>

          <div className="reasoning">
            <span>Validator reasoning</span>
            <p>{item.reasoning || 'No verification reasoning has been recorded yet.'}</p>
          </div>

          {maySubmit && <div className="evidence-form">
            <label>Completion HTTPS URL<input type="url" value={completionUrl} onChange={(event) => wearline.setCompletionUrls({ ...wearline.completionUrls, [item.index]: event.target.value })}/></label>
            <label>Completion SHA-256<input value={completionHash} onChange={(event) => wearline.setCompletionHashes({ ...wearline.completionHashes, [item.index]: event.target.value })}/></label>
            <div className="workflow-actions">
              <button className="secondary-button" type="button" disabled={!completionUrl} onClick={() => void wearline.hashUrl(completionUrl, (hash) => wearline.setCompletionHashes({ ...wearline.completionHashes, [item.index]: hash }))}>Hash URL bytes</button>
              <label className="file-button">Hash local image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (file) wearline.setCompletionHashes({ ...wearline.completionHashes, [item.index]: await sha256File(file) }) }}/></label>
              <button className="primary-button" type="button" disabled={wearline.busy || !completionUrl || !completionHash} onClick={() => void (async () => {
                try {
                  await wearline.transact('submit_completion', [wearline.caseId, item.index, evidenceUrl(completionUrl), digest(completionHash)])
                } catch (cause) {
                  wearline.setError(cause instanceof Error ? cause.message : String(cause))
                }
              })()}>Submit completion evidence</button>
            </div>
          </div>}

          {mayVerify && <div className="verify-action">
            <button className="primary-button" disabled={wearline.busy} onClick={() => void wearline.transact('verify_item', [wearline.caseId, item.index]).catch((cause) => wearline.setError(cause instanceof Error ? cause.message : String(cause)))}>
              Run GenLayer verification
            </button>
          </div>}
        </article>
      })}
    </div>}
  </section>
}
