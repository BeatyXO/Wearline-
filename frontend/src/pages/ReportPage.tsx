import { CaseLookup } from '../components/CaseLookup'
import { useWearline } from '../context/WearlineContext'

export function ReportPage() {
  const wearline = useWearline()
  const current = wearline.caseData
  const loaded = Boolean(current && current.id === wearline.caseId)
  const counts = {
    SATISFIED: wearline.items.filter((item) => item.verdict === 'SATISFIED').length,
    PARTIALLY_SATISFIED: wearline.items.filter((item) => item.verdict === 'PARTIALLY_SATISFIED').length,
    NOT_SATISFIED: wearline.items.filter((item) => item.verdict === 'NOT_SATISFIED').length,
    INCONCLUSIVE: wearline.items.filter((item) => item.verdict === 'INCONCLUSIVE').length,
  }

  return <section className="page section-pad">
    <div className="page-heading">
      <span className="kicker">Verification report</span>
      <h1>Requirement-level results, without hidden overrides.</h1>
      <p>The case result is derived from the item verdicts after every registered requirement has received a final determination.</p>
    </div>

    {!loaded && <>
      <CaseLookup/>
      <div className="empty-state large">{wearline.caseId ? 'Load this case to view its verification report.' : 'Choose a case to continue.'}</div>
    </>}

    {loaded && current && <>
      <section className="report-panel">
        <div><span>Case</span><strong>#{current.id}</strong></div>
        <div><span>Requirements verified</span><strong>{current.verified_count} / {current.item_count}</strong></div>
        <div className="report-result"><span>Case result</span><strong>{current.result ? current.result.replaceAll('_', ' ') : 'PENDING'}</strong></div>
      </section>

      <section className="surface report-details">
        <div><span>SATISFIED</span><strong>{counts.SATISFIED}</strong></div>
        <div><span>PARTIALLY SATISFIED</span><strong>{counts.PARTIALLY_SATISFIED}</strong></div>
        <div><span>NOT SATISFIED</span><strong>{counts.NOT_SATISFIED}</strong></div>
        <div><span>INCONCLUSIVE</span><strong>{counts.INCONCLUSIVE}</strong></div>
      </section>

      <section className="surface report-summary">
        <div>
          <span className="kicker">Derived status</span>
          <h2>{current.status === 'VERIFIED' ? 'Verification complete' : 'Verification still in progress'}</h2>
          <p>{current.status === 'VERIFIED'
            ? current.result === 'ACCEPTED'
              ? 'Every frozen remediation requirement was satisfied.'
              : current.result === 'REVIEW_REQUIRED'
                ? 'At least one requirement is inconclusive, so this case cannot be treated as accepted.'
                : 'At least one requirement remains partially or materially unsatisfied.'
            : 'Complete the remaining item verifications before the case result is derived.'}</p>
        </div>
      </section>

      <section className="surface report-items">
        <div className="section-title"><div><span className="kicker">Item record</span><h2>Frozen requirements and verdicts</h2></div></div>
        <div className="item-list">{wearline.items.map((item) => <article key={item.index}>
          <span className="item-number">{String(item.index + 1).padStart(2, '0')}</span>
          <div><strong>{item.label}</strong><small>{item.remediation_requirement}</small><p>{item.reasoning || 'Awaiting verification.'}</p></div>
          <span>{item.verdict ? item.verdict.replaceAll('_', ' ') : 'Pending'}</span>
        </article>)}</div>
      </section>
    </>}
  </section>
}
