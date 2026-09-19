export type WearlineVerdict = 'SATISFIED' | 'PARTIALLY_SATISFIED' | 'NOT_SATISFIED' | 'INCONCLUSIVE'
export type CaseResult = 'ACCEPTED' | 'REMEDIATION_REQUIRED' | 'REVIEW_REQUIRED' | ''

export type RemediationCaseView = {
  id: string
  requester: string
  remediator: string
  title: string
  status: 'DRAFT' | 'SEALED' | 'REVIEWING' | 'VERIFIED' | string
  result: CaseResult | string
  item_count: number
  verified_count: number
  created_at: string
  sealed: boolean
}

export type RemediationItemView = {
  index: number
  label: string
  defect_description: string
  baseline_url: string
  baseline_sha256: string
  remediation_requirement: string
  completion_url: string
  completion_sha256: string
  verdict: WearlineVerdict | ''
  reasoning: string
  verified: boolean
}
