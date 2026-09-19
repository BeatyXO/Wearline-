import { ArrowRight, BadgeCheck, FileCheck2, LockKeyhole, ScanSearch } from 'lucide-react'
import { useWearline } from '../context/WearlineContext'
import { navigate, routeHref } from '../components/AppLayout'

export function HomePage() {
  const { caseData, caseId, contractLabel, explorerAddress, live } = useWearline()
  const href = (path: string) => routeHref(path, caseId)

  return <>
    <section className="hero section-pad">
      <div className="hero-copy">
        <div className="eyebrow">GenLayer StudioNet · 61999</div>
        <h1>Verify physical remediation against a requirement frozen before completion.</h1>
        <p>Wearline verifies whether physical repair or remediation work satisfies a requirement that was frozen before the work was completed.</p>
        <div className="hero-actions">
          <a className="primary-button" href={href('/case')} onClick={(event) => { event.preventDefault(); navigate(href('/case')) }}>
            Create / open a case <ArrowRight size={17}/>
          </a>
          <a className="secondary-button" href={href('/evidence')} onClick={(event) => { event.preventDefault(); navigate(href('/evidence')) }}>
            Review evidence
          </a>
        </div>
        <div className="trust-row">
          <span><LockKeyhole size={15}/> SHA-256-bound evidence</span>
          <span><BadgeCheck size={15}/> Frozen requirements</span>
          <span><ScanSearch size={15}/> Independent verification</span>
        </div>
      </div>

      <div className="hero-card">
        <div className="hero-card-head">
          <div><span className="muted-label">Contract</span><h3>{contractLabel}</h3></div>
          <span className="status-pill">{live ? 'StudioNet configured' : 'Deployment pending'}</span>
        </div>
        <div className="mini-grid">
          <div><span>Network</span><strong>StudioNet 61999</strong></div>
          <div><span>Case</span><strong>{caseData ? `#${caseData.id}` : 'Not loaded'}</strong></div>
          <div><span>Requirements</span><strong>{caseData ? caseData.item_count : '—'}</strong></div>
          <div><span>State</span><strong>{caseData?.status ?? '—'}</strong></div>
        </div>
        {live && explorerAddress
          ? <a className="contract-strip" href={explorerAddress} target="_blank" rel="noreferrer"><span className="dot live"/><div><small>StudioNet deployment</small><strong>{contractLabel} ↗</strong></div></a>
          : <div className="contract-strip pending"><span className="dot"/><div><small>StudioNet deployment</small><strong>Fresh contract address pending</strong></div></div>}
      </div>
    </section>

    <section className="feature-strip section-pad">
      <article><FileCheck2/><div><strong>Freeze first</strong><span>Baseline evidence and the exact remediation requirement become immutable when the case is sealed.</span></div></article>
      <article><ScanSearch/><div><strong>Verify the requirement</strong><span>GenLayer evaluates completion evidence only against the frozen requirement.</span></div></article>
      <article><BadgeCheck/><div><strong>Fail closed</strong><span>Ambiguous evidence becomes INCONCLUSIVE and can never become automatic acceptance.</span></div></article>
    </section>
  </>
}
