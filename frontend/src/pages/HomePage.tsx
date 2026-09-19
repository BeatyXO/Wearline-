import { ArrowRight, BadgeCheck, CircleDollarSign, FileCheck2, LockKeyhole, Scale, ShieldCheck } from 'lucide-react'
import { gen, useWearline } from '../context/WearlineContext'
import { navigate, routeHref } from '../components/AppLayout'
export function HomePage(){
 const {agreement,agreementId,contractLabel,explorerAddress,live}=useWearline()
 const href=(p:string)=>routeHref(p,agreementId)
 return <>
  <section className="hero section-pad">
   <div className="hero-copy"><div className="eyebrow">GenLayer StudioNet · 61999</div><h1>Evidence-led security deposit settlement on GenLayer.</h1><p>Validators decide visible condition change; frozen rules decide the payout.</p>
    <div className="hero-actions"><a className="primary-button" href={href('/agreement')} onClick={e=>{e.preventDefault();navigate(href('/agreement'))}}>Create / open an agreement <ArrowRight size={17}/></a><a className="secondary-button" href={href('/evidence')} onClick={e=>{e.preventDefault();navigate(href('/evidence'))}}>Review an existing agreement</a></div>
    <div className="trust-row"><span><LockKeyhole size={15}/> SHA-256-bound evidence</span><span><ShieldCheck size={15}/> Independent validation</span><span><Scale size={15}/> Deterministic deductions</span></div>
   </div>
   <div className="hero-card"><div className="hero-card-head"><div><span className="muted-label">Canonical contract</span><h3>{contractLabel}</h3></div><span className="status-pill">{live?'StudioNet live':'Setup required'}</span></div>
    <div className="mini-grid"><div><span>Network</span><strong>StudioNet 61999</strong></div><div><span>Agreement</span><strong>{agreement?'#'+agreement.id:'Not loaded'}</strong></div><div><span>Deposit</span><strong>{agreement?gen(agreement.deposit_required):'—'}</strong></div><div><span>State</span><strong>{agreement?.status??'—'}</strong></div></div>
    <a className="contract-strip" href={explorerAddress} target="_blank" rel="noreferrer"><span className="dot live"/><div><small>Canonical deployment</small><strong>{contractLabel} ↗</strong></div></a>
   </div>
  </section>
  <section className="feature-strip section-pad"><article><FileCheck2/><div><strong>Evidence first</strong><span>Baseline and checkout images are bound by SHA-256.</span></div></article><article><BadgeCheck/><div><strong>Independent review</strong><span>Validators classify condition change and severity.</span></div></article><article><CircleDollarSign/><div><strong>Frozen payout rules</strong><span>The model cannot choose the transfer amount.</span></div></article></section>
 </>
}
