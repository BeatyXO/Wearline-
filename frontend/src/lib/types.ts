export type WearClassification = 'UNCHANGED' | 'NORMAL_WEAR' | 'NEW_DAMAGE' | 'INCONCLUSIVE'

export type AgreementView = {
  id: string
  propertyLabel: string
  owner: string
  renter: string
  depositRequired: bigint
  depositFunded: bigint
  status: string
  itemCount: number
  adjudicatedCount: number
  totalDeduction: bigint
  sealed: boolean
}

export type ItemView = {
  index: number
  label: string
  baselineUrl: string
  checkoutUrl: string
  classification: WearClassification | ''
  severity: number
  maxDeduction: bigint
  deduction: bigint
  rationale: string
  adjudicated: boolean
}
