import { FLOW, useWearline } from '../context/WearlineContext'

export function WorkflowProgress() {
  const { stepIndex } = useWearline()
  return <div className="flow-track">
    {FLOW.map((step, index) => <div className={`flow-step ${index <= stepIndex ? 'done' : ''}`} key={step}>
      <div>{index < stepIndex ? '✓' : index + 1}</div>
      <span>{step.replaceAll('_', ' ')}</span>
    </div>)}
  </div>
}
