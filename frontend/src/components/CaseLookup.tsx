import { RefreshCw } from 'lucide-react'
import { useWearline } from '../context/WearlineContext'

export function CaseLookup() {
  const { caseId, setCaseId, refresh, client, loading, live } = useWearline()
  return <div className="lookup-card">
    <div>
      <span className="kicker">Case lookup</span>
      <h3>Open authoritative on-chain state</h3>
      <p>Enter a case ID. The selected ID stays in the URL across Case, Evidence and Report.</p>
    </div>
    <div className="lookup">
      <label>
        Case ID
        <input
          inputMode="numeric"
          value={caseId}
          onChange={(event) => setCaseId(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && void refresh()}
        />
      </label>
      <button className="secondary-button" disabled={!live || !client || loading || !caseId} onClick={() => void refresh()}>
        <RefreshCw size={15}/>{loading ? 'Loading…' : 'Load case'}
      </button>
    </div>
  </div>
}
