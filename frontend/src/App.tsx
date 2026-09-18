import { FormEvent, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Gauge,
  Image,
  Landmark,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'
import { connectWallet, CONTRACT_ADDRESS, HAS_CONTRACT, shortAddress, writeWearline } from './lib/genlayer'

const sampleItems = [
  { label: 'Living room flooring', classification: 'NORMAL_WEAR', severity: 0, cap: '1.80 GEN', deduction: '0.00 GEN', rationale: 'Light surface scuffing is visible, with no clear new gouge, break, or material loss.' },
  { label: 'Bedroom wardrobe', classification: 'NEW_DAMAGE', severity: 2, cap: '2.00 GEN', deduction: '1.20 GEN', rationale: 'Checkout evidence shows a new split at the lower right panel that is absent from the baseline.' },
  { label: 'Kitchen counter', classification: 'UNCHANGED', severity: 0, cap: '1.50 GEN', deduction: '0.00 GEN', rationale: 'Surface marks and edge condition materially match the baseline image.' },
  { label: 'Entry door', classification: 'INCONCLUSIVE', severity: 0, cap: '1.25 GEN', deduction: '0.00 GEN', rationale: 'Checkout framing obscures the lower hinge area, so a reliable comparison cannot be made.' },
]

const flow = ['Draft', 'Sealed', 'Funded', 'Reviewing', 'Ready', 'Settled']

function App() {
  const [wallet, setWallet] = useState<string>('')
  const [walletClient, setWalletClient] = useState<any>(null)
  const [notice, setNotice] = useState('')
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [agreementId, setAgreementId] = useState('1')
  const [propertyLabel, setPropertyLabel] = useState('')
  const [renter, setRenter] = useState('')
  const [deposit, setDeposit] = useState('')
  const [policy, setPolicy] = useState(
    'Normal wear includes light scuffs and gradual cosmetic aging from ordinary residential use. New cracks, breaks, burns, missing parts, deep gouges, or material deformation are damage.',
  )

  const liveMode = HAS_CONTRACT
  const contractLabel = useMemo(() => (CONTRACT_ADDRESS ? shortAddress(CONTRACT_ADDRESS) : 'Awaiting deployment'), [])

  async function onConnect() {
    setNotice('')
    try {
      const connected = await connectWallet()
      setWallet(connected.address)
      setWalletClient(connected.client)
      setNotice('Wallet connected to StudioNet 61999.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Wallet connection failed.')
    }
  }

  async function onCreateAgreement(event: FormEvent) {
    event.preventDefault()
    if (!liveMode) {
      setNotice('Preview mode: deploy Wearline and set VITE_WEARLINE_CONTRACT_ADDRESS to enable writes.')
      return
    }
    if (!walletClient) {
      setNotice('Connect your wallet before creating an agreement.')
      return
    }
    try {
      setSubmitting(true)
      const wei = BigInt(Math.round(Number(deposit) * 1e6)) * 10n ** 12n
      const tx = await writeWearline(walletClient, 'create_agreement', [renter, propertyLabel, wei, policy])
      setNotice(`Agreement submitted: ${tx}`)
      setCreating(false)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Agreement submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Wearline home"><span className="brand-mark">W</span><span>Wearline</span></a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#agreement">Agreement</a><a href="#evidence">Evidence</a><a href="#settlement">Settlement</a>
          <a href="https://github.com/BeatyXO/Wearline-" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <button className="wallet-button" onClick={onConnect}><Wallet size={17} /> {wallet ? shortAddress(wallet) : 'Connect wallet'}</button>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={15} /> GenLayer StudioNet · 61999</div>
            <h1>Deposits settled by <span>evidence,</span><br />not discretion.</h1>
            <p>Wearline freezes the rules before move-out, lets GenLayer validators classify visible condition change, and keeps every payout inside deterministic limits.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setCreating(true)}>Create agreement <ArrowRight size={17} /></button>
              <a className="secondary-button" href="#evidence">See the review flow</a>
            </div>
            <div className="trust-row">
              <span><LockKeyhole size={15} /> Hash-bound evidence</span>
              <span><ShieldCheck size={15} /> Independent validation</span>
              <span><Scale size={15} /> Deterministic settlement</span>
            </div>
          </div>

          <div className="hero-card glass-card">
            <div className="hero-card-head">
              <div><span className="muted-label">Active agreement</span><h3>Harborview · Unit 18B</h3></div>
              <span className="status-pill reviewing">Reviewing</span>
            </div>
            <div className="deposit-ring-wrap"><div className="deposit-ring"><div><strong>8.40</strong><span>GEN locked</span></div></div></div>
            <div className="mini-grid">
              <div><span>Items</span><strong>4</strong></div><div><span>Resolved</span><strong>3</strong></div>
              <div><span>Deduction</span><strong>1.20 GEN</strong></div><div><span>Refund</span><strong>7.20 GEN</strong></div>
            </div>
            <div className="contract-strip">
              <span className={`dot ${liveMode ? 'live' : ''}`} />
              <div><small>{liveMode ? 'Live contract' : 'Preview mode'}</small><strong>{contractLabel}</strong></div>
            </div>
          </div>
        </section>

        {notice && <div className="notice-bar">{notice}</div>}

        <section className="metric-strip section-pad">
          <div><Gauge size={21} /><span>Consensus scope</span><strong>2 decision fields</strong></div>
          <div><Image size={21} /><span>Evidence pair</span><strong>Baseline + checkout</strong></div>
          <div><CircleDollarSign size={21} /><span>Model payout authority</span><strong>0%</strong></div>
          <div><BadgeCheck size={21} /><span>Network</span><strong>StudioNet 61999</strong></div>
        </section>

        <section id="agreement" className="content-section section-pad">
          <div className="section-heading">
            <div><span className="kicker">Frozen before the dispute</span><h2>One agreement. One rulebook.</h2></div>
            <p>Wearline makes the settlement logic inspectable before funds are ever at risk.</p>
          </div>
          <div className="agreement-panel glass-card">
            <div className="agreement-topline">
              <div><span className="muted-label">Agreement #{agreementId}</span><h3>Harborview · Unit 18B</h3><p>Residential tenancy · evidence policy v1</p></div>
              <label className="agreement-jump"><span>Agreement ID</span><input value={agreementId} onChange={(e) => setAgreementId(e.target.value.replace(/\D/g, ''))} /></label>
            </div>
            <div className="flow-track">
              {flow.map((step, index) => <div className={`flow-step ${index <= 3 ? 'done' : ''}`} key={step}><div>{index < 3 ? '✓' : index + 1}</div><span>{step}</span></div>)}
            </div>
            <div className="rule-grid">
              <article><LockKeyhole /><span>Deposit</span><strong>8.40 GEN</strong><small>Exact funding required</small></article>
              <article><FileCheck2 /><span>Inventory</span><strong>4 frozen items</strong><small>Caps total ≤ deposit</small></article>
              <article><Scale /><span>Damage matrix</span><strong>25 / 60 / 100%</strong><small>Severity 1 / 2 / 3</small></article>
              <article><ShieldCheck /><span>Inconclusive</span><strong>Fail closed</strong><small>No automatic deduction</small></article>
            </div>
          </div>
        </section>

        <section id="evidence" className="content-section evidence-section section-pad">
          <div className="section-heading">
            <div><span className="kicker">Consensus review</span><h2>Compare what changed.</h2></div>
            <p>The model classifies visible change only. Prices and payouts never enter the prompt.</p>
          </div>
          <div className="evidence-layout">
            <div className="evidence-visual glass-card">
              <div className="evidence-tabs"><button className="active">Before</button><button>Checkout</button></div>
              <div className="room-placeholder"><div className="room-window" /><div className="room-sofa" /><div className="room-rug" /><span>Hash-bound baseline evidence</span></div>
              <div className="hash-line"><LockKeyhole size={14} /> sha256 · 5f6c…2b91</div>
            </div>
            <div className="review-list">
              {sampleItems.map((item, index) => (
                <article className="review-card" key={item.label}>
                  <div className="review-index">0{index + 1}</div>
                  <div className="review-body">
                    <div className="review-title-row"><h3>{item.label}</h3><span className={`class-pill ${item.classification.toLowerCase().replace('_', '-')}`}>{item.classification.replace('_', ' ')}</span></div>
                    <p>{item.rationale}</p>
                    <div className="review-numbers"><span>Severity <strong>{item.severity}</strong></span><span>Frozen cap <strong>{item.cap}</strong></span><span>Deduction <strong>{item.deduction}</strong></span></div>
                  </div>
                  <ChevronRight className="row-chevron" size={18} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="settlement" className="content-section section-pad">
          <div className="settlement-panel">
            <div className="settlement-copy">
              <span className="kicker light">Deterministic after consensus</span>
              <h2>The model never touches the payout.</h2>
              <p>Once validators agree on classification and severity, Wearline applies the frozen matrix on-chain. Inconclusive evidence cannot quietly become a charge.</p>
              <div className="formula-card">
                <div><span>Locked deposit</span><strong>8.40 GEN</strong></div><span className="formula-op">−</span>
                <div><span>Accepted deductions</span><strong>1.20 GEN</strong></div><span className="formula-op">=</span>
                <div className="formula-result"><span>Renter refund</span><strong>7.20 GEN</strong></div>
              </div>
            </div>
            <div className="settlement-side">
              <Landmark size={28} /><span>Settlement guard</span><strong>1 unresolved item</strong>
              <p>Entry door is INCONCLUSIVE. Owner waiver is required before settlement can execute.</p>
              <button className="settle-button" disabled>Settlement blocked</button>
            </div>
          </div>
        </section>

        <section className="final-cta section-pad">
          <div><span className="kicker">Wearline primitive</span><h2>Visual judgment where it belongs.<br />Money rules where they belong.</h2></div>
          <button className="primary-button inverted" onClick={() => setCreating(true)}>Start a new agreement <ArrowRight size={17} /></button>
        </section>
      </main>

      <footer className="footer section-pad">
        <div className="brand"><span className="brand-mark">W</span><span>Wearline</span></div>
        <p>Built for GenLayer StudioNet · chain 61999 · single Intelligent Contract</p>
        <a href="https://github.com/BeatyXO/Wearline-" target="_blank" rel="noreferrer">View source ↗</a>
      </footer>

      {creating && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setCreating(false)}>
          <div className="modal-card">
            <div className="modal-head"><div><span className="kicker">New agreement</span><h2>Freeze the terms first.</h2></div><button className="icon-button" onClick={() => setCreating(false)} aria-label="Close"><X /></button></div>
            <form onSubmit={onCreateAgreement}>
              <label>Property / asset label<input required value={propertyLabel} onChange={(e) => setPropertyLabel(e.target.value)} placeholder="e.g. Harborview · Unit 18B" /></label>
              <label>Renter wallet<input required value={renter} onChange={(e) => setRenter(e.target.value)} placeholder="0x…" /></label>
              <label>Required deposit (GEN)<input required type="number" min="0.01" step="0.01" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="8.40" /></label>
              <label>Frozen normal-wear policy<textarea required rows={5} value={policy} onChange={(e) => setPolicy(e.target.value)} /></label>
              <div className="modal-note"><ShieldCheck size={18} /> Inventory and per-item deduction caps are added before sealing. Once sealed, they cannot be edited.</div>
              <button className="primary-button full" disabled={submitting}>{submitting ? 'Submitting…' : liveMode ? 'Create on StudioNet' : 'Preview only — deployment pending'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
