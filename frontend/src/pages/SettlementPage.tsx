import { AgreementLookup } from '../components/AgreementLookup'
import { gen, useWearline } from '../context/WearlineContext'
export function SettlementPage(){
 const w=useWearline(); const a=w.agreement; const loaded=Boolean(a&&a.id===w.agreementId); const allowed=Boolean(a&&w.party&&a.status==='READY_TO_SETTLE'&&w.unresolved===0)
 return <section className="page section-pad">
  <div className="page-heading"><span className="kicker">Settlement</span><h1>The payout is arithmetic, not judgment.</h1><p>Consensus classifies evidence. The frozen agreement rules determine deductions and the real settlement transaction remains unchanged.</p></div>
  {!loaded&&<><AgreementLookup/><div className="empty-state large">{w.agreementId?'Load this agreement to calculate settlement.':'Choose an agreement to continue.'}</div></>}
  {loaded&&a&&<>
   <section className="settlement-panel"><div><span>Deposit</span><strong>{gen(a.deposit_required)}</strong></div><span className="formula-op">−</span><div><span>Total deduction</span><strong>{gen(a.total_deduction)}</strong></div><span className="formula-op">=</span><div className="refund"><span>Renter refund</span><strong>{gen(a.deposit_required-a.total_deduction)}</strong></div></section>
   <section className="settlement-details surface"><div><span>Owner deduction</span><strong>{gen(a.total_deduction)}</strong></div><div><span>Renter refund</span><strong>{gen(a.deposit_required-a.total_deduction)}</strong></div><div><span>Agreement state</span><strong>{a.status.replaceAll('_',' ')}</strong></div><div><span>Unresolved inconclusive</span><strong>{w.unresolved}</strong></div><div><span>Settlement allowed</span><strong>{allowed?'Yes':'No'}</strong></div><div><span>Connected role</span><strong>{w.owner?'Owner':w.renterRole?'Renter':'Not an agreement party'}</strong></div></section>
   <section className="surface settlement-action"><div><span className="kicker">On-chain action</span><h2>{a.status==='SETTLED'?'Agreement settled':allowed?'Ready to settle':'Settlement currently blocked'}</h2><p>{w.unresolved?'Owner waiver is required for every unresolved inconclusive item.':!w.party?'Connect the owner or renter wallet for this agreement.':a.status!=='READY_TO_SETTLE'&&a.status!=='SETTLED'?'Complete the remaining lifecycle steps first.':'The settlement transaction will finalize through the existing GenLayer client flow.'}</p></div><button className="primary-button" disabled={w.busy||!allowed} onClick={()=>void w.transact('settle',[w.agreementId]).catch(e=>w.setError(e instanceof Error?e.message:String(e)))}>{w.busy?'Transaction pending…':'Settle on StudioNet'}</button></section>
  </>}
 </section>
}
