import { RefreshCw } from 'lucide-react'
import { useWearline } from '../context/WearlineContext'
export function AgreementLookup(){
  const {agreementId,setAgreementId,refresh,client,loading}=useWearline()
  return <div className="lookup-card">
    <div><span className="kicker">Agreement lookup</span><h3>Open canonical on-chain state</h3><p>Enter an agreement ID. The selected ID stays in the URL across Agreement, Evidence and Settlement.</p></div>
    <div className="lookup">
      <label>Agreement ID<input inputMode="numeric" value={agreementId} onChange={e=>setAgreementId(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void refresh()}/></label>
      <button className="secondary-button" disabled={!client||loading||!agreementId} onClick={()=>void refresh()}><RefreshCw size={15}/>{loading?'Loading…':'Load agreement'}</button>
    </div>
  </div>
}
