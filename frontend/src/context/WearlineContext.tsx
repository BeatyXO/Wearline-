import { FormEvent, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  assertStudioNet,
  connectWallet,
  CONTRACT_ADDRESS,
  HAS_CONTRACT,
  readClient,
  readWearline,
  restoreWallet,
  revokeWalletPermission,
  shortAddress,
  STUDIONET_CHAIN_ID,
  switchToStudioNet,
  walletClientForAccount,
  writeWearline,
} from '../lib/genlayer'
import { sha256File } from '../lib/hash'
import type { RemediationCaseView, RemediationItemView } from '../lib/types'

export type Raw = Record<string, unknown>
export type Item = RemediationItemView
export type CaseData = RemediationCaseView

export const FLOW = ['DRAFT', 'SEALED', 'REVIEWING', 'VERIFIED']
export const EXPLORER = 'https://explorer-studio.genlayer.com'

const str = (value: unknown) => String(value ?? '')
const num = (value: unknown) => Number(value ?? 0)

export function evidenceUrl(value: string) {
  const normalized = value.trim()
  if (!/^https:\/\//i.test(normalized)) throw new Error('Evidence URL must use HTTPS.')
  return normalized
}

export function digest(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error('SHA-256 must contain exactly 64 hexadecimal characters.')
  }
  return normalized
}

type Ctx = {
  wallet: string
  client: any
  caseId: string
  caseData: CaseData | null
  items: Item[]
  busy: boolean
  loading: boolean
  wrongNetwork: boolean
  error: string
  notice: string
  txHash: string
  live: boolean
  contractLabel: string
  explorerAddress: string
  explorerTx: string
  requesterRole: boolean
  remediatorRole: boolean
  stepIndex: number
  title: string
  remediator: string
  label: string
  defect: string
  baselineUrl: string
  baselineHash: string
  requirement: string
  completionUrls: Record<number, string>
  completionHashes: Record<number, string>
  setTitle: (value: string) => void
  setRemediator: (value: string) => void
  setLabel: (value: string) => void
  setDefect: (value: string) => void
  setBaselineUrl: (value: string) => void
  setBaselineHash: (value: string) => void
  setRequirement: (value: string) => void
  setCompletionUrls: (value: Record<number, string>) => void
  setCompletionHashes: (value: Record<number, string>) => void
  setCaseId: (value: string) => void
  setError: (value: string) => void
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchNetwork: () => Promise<void>
  refresh: (id?: string, activeClient?: any) => Promise<void>
  transact: (name: string, args: unknown[]) => Promise<string | undefined>
  createCase: (event: FormEvent) => Promise<void>
  addItem: (event: FormEvent) => Promise<void>
  hashUrl: (raw: string, onHash: (hash: string) => void) => Promise<void>
}

const WearlineContext = createContext<Ctx | null>(null)

export function WearlineProvider({ children }: { children: ReactNode }) {
  const initialId = new URLSearchParams(window.location.search).get('id')?.replace(/\D/g, '') ?? ''
  const [wallet, setWallet] = useState('')
  const [client, setClient] = useState<ReturnType<typeof readClient> | any>(null)
  const [wrongNetwork, setWrongNetwork] = useState(false)
  const [caseIdState, setCaseIdState] = useState(initialId)
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [txHash, setTxHash] = useState('')

  const [title, setTitle] = useState('')
  const [remediator, setRemediator] = useState('')
  const [label, setLabel] = useState('')
  const [defect, setDefect] = useState('')
  const [baselineUrl, setBaselineUrl] = useState('')
  const [baselineHash, setBaselineHash] = useState('')
  const [requirement, setRequirement] = useState('')
  const [completionUrls, setCompletionUrls] = useState<Record<number, string>>({})
  const [completionHashes, setCompletionHashes] = useState<Record<number, string>>({})

  const locked = useRef(false)
  const live = HAS_CONTRACT
  const contractLabel = useMemo(
    () => (CONTRACT_ADDRESS ? shortAddress(CONTRACT_ADDRESS) : 'Pending deployment'),
    [],
  )
  const explorerAddress = CONTRACT_ADDRESS ? `${EXPLORER}/address/${CONTRACT_ADDRESS}` : ''

  const clearWalletState = useCallback(() => {
    setWallet('')
    setClient(null)
    setWrongNetwork(false)
    setCaseData(null)
    setItems([])
    setTxHash('')
  }, [])

  const setCaseId = useCallback((value: string) => {
    const id = value.replace(/\D/g, '')
    setCaseIdState(id)
    setCaseData(null)
    setItems([])
    const next = new URL(window.location.href)
    if (id) next.searchParams.set('id', id)
    else next.searchParams.delete('id')
    window.history.replaceState({}, '', next)
  }, [])

  const refresh = useCallback(async (id = caseIdState, activeClient = client) => {
    if (!live || !id || !activeClient) return
    setLoading(true)
    setError('')
    try {
      const raw = await readWearline(activeClient, 'get_case', [id]) as Raw
      const nextCase: CaseData = {
        id,
        requester: str(raw.requester),
        remediator: str(raw.remediator),
        title: str(raw.title),
        status: str(raw.status),
        result: str(raw.result),
        item_count: num(raw.item_count),
        verified_count: num(raw.verified_count),
        created_at: str(raw.created_at),
        sealed: Boolean(raw.sealed),
      }
      const fetched: Item[] = []
      for (let index = 0; index < nextCase.item_count; index += 1) {
        const item = await readWearline(activeClient, 'get_item', [id, index]) as Raw
        fetched.push({
          index,
          label: str(item.label),
          defect_description: str(item.defect_description),
          baseline_url: str(item.baseline_url),
          baseline_sha256: str(item.baseline_sha256),
          remediation_requirement: str(item.remediation_requirement),
          completion_url: str(item.completion_url),
          completion_sha256: str(item.completion_sha256),
          verdict: str(item.verdict) as Item['verdict'],
          reasoning: str(item.reasoning),
          verified: Boolean(item.verified),
        })
      }
      setCaseData(nextCase)
      setItems(fetched)
      setNotice('Case data refreshed from StudioNet.')
    } catch (cause) {
      setCaseData(null)
      setItems([])
      setError(cause instanceof Error ? cause.message : 'Unable to load case data from StudioNet.')
    } finally {
      setLoading(false)
    }
  }, [caseIdState, client, live])

  useEffect(() => {
    if (client && caseIdState && !wrongNetwork) void refresh(caseIdState, client)
  }, [client, caseIdState, wrongNetwork, refresh])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const restored = await restoreWallet()
        if (!active || !restored) return
        setWallet(restored.address)
        setClient(restored.client)
        setWrongNetwork(restored.wrongNetwork)
        if (restored.wrongNetwork) {
          setNotice('Wallet restored. Switch to GenLayer StudioNet 61999 to continue.')
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to restore the authorised wallet session.')
      }
    })()
    return () => { active = false }
  }, [])

  useEffect(() => {
    const injected = window.ethereum as import('../lib/genlayer').InjectedProvider | undefined

    const accounts = async (value: unknown) => {
      const address = Array.isArray(value) ? str(value[0]) : ''
      if (!address) {
        clearWalletState()
        setNotice('Wallet disconnected from Wearline.')
        return
      }
      setWallet(address)
      setError('')
      try {
        const chainId = await injected?.request({ method: 'eth_chainId' })
        if (String(chainId).toLowerCase() !== STUDIONET_CHAIN_ID) {
          setClient(null)
          setWrongNetwork(true)
          setNotice('Wallet account changed. Switch to GenLayer StudioNet 61999 to continue.')
          return
        }
        const nextClient = await walletClientForAccount(address)
        setClient(nextClient)
        setWrongNetwork(false)
        setNotice('Wallet account updated on StudioNet 61999.')
      } catch (cause) {
        setClient(null)
        setError(cause instanceof Error ? cause.message : 'Unable to restore the changed wallet account.')
      }
    }

    const chain = async (value: unknown) => {
      if (!wallet) return
      if (String(value).toLowerCase() !== STUDIONET_CHAIN_ID) {
        setClient(null)
        setWrongNetwork(true)
        setError('')
        setNotice('Wallet is connected, but GenLayer StudioNet 61999 is required.')
        return
      }
      try {
        const nextClient = await walletClientForAccount(wallet)
        setClient(nextClient)
        setWrongNetwork(false)
        setError('')
        setNotice('Back on GenLayer StudioNet 61999.')
      } catch (cause) {
        setClient(null)
        setError(cause instanceof Error ? cause.message : 'Unable to reconnect to StudioNet.')
      }
    }

    injected?.on?.('accountsChanged', accounts)
    injected?.on?.('chainChanged', chain)
    return () => {
      injected?.removeListener?.('accountsChanged', accounts)
      injected?.removeListener?.('chainChanged', chain)
    }
  }, [wallet, clearWalletState])

  async function connect() {
    setError('')
    try {
      const connected = await connectWallet()
      setWallet(connected.address)
      setClient(connected.client)
      setWrongNetwork(false)
      setNotice('Wallet connected to StudioNet 61999.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Wallet connection failed.')
    }
  }

  async function switchNetwork() {
    setError('')
    try {
      if (!wallet) throw new Error('Connect a wallet first.')
      await switchToStudioNet()
      const nextClient = await walletClientForAccount(wallet)
      setClient(nextClient)
      setWrongNetwork(false)
      setNotice('Connected to GenLayer StudioNet 61999.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to switch to StudioNet.')
    }
  }

  async function disconnect() {
    setError('')
    const revoked = await revokeWalletPermission()
    clearWalletState()
    setNotice(revoked
      ? 'Wallet permission revoked and Wearline disconnected.'
      : 'Wearline disconnected locally. Your wallet may still list this site as authorised.')
  }

  async function transact(name: string, args: unknown[]) {
    if (!live) throw new Error('Fresh StudioNet deployment is still pending.')
    if (!client || wrongNetwork) throw new Error('GenLayer StudioNet 61999 is required before continuing.')
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    setNotice('')
    setTxHash('')
    try {
      const injected = window.ethereum as { request: (args: { method: string }) => Promise<unknown> } | undefined
      if (!injected) throw new Error('No injected wallet detected.')
      assertStudioNet(await injected.request({ method: 'eth_chainId' }))
      const accounts = await injected.request({ method: 'eth_accounts' }) as string[]
      if (!accounts?.[0] || accounts[0].toLowerCase() !== wallet.toLowerCase()) {
        throw new Error('The connected wallet account changed. Reconnect before sending a transaction.')
      }
      const hash = await writeWearline(client, name, args)
      setTxHash(hash)
      setNotice(`${name} finalized successfully on StudioNet.`)
      if (caseIdState) await refresh(caseIdState, client)
      return hash
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      const match = message.match(/0x[a-fA-F0-9]{64}/)
      if (match) setTxHash(match[0])
      throw cause
    } finally {
      locked.current = false
      setBusy(false)
    }
  }

  async function createCase(event: FormEvent) {
    event.preventDefault()
    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(remediator.trim())) {
        throw new Error('Enter a valid remediator address.')
      }
      if (title.trim().length < 3) throw new Error('Enter a case title of at least 3 characters.')
      const id = str(await readWearline(client, 'get_next_case_id', []))
      await transact('create_case', [remediator.trim(), title.trim()])
      setCaseId(id)
      setNotice(`Case #${id} created and finalized.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  async function addItem(event: FormEvent) {
    event.preventDefault()
    try {
      await transact('add_item', [
        caseIdState,
        label.trim(),
        defect.trim(),
        evidenceUrl(baselineUrl),
        digest(baselineHash),
        requirement.trim(),
      ])
      setLabel('')
      setDefect('')
      setBaselineUrl('')
      setBaselineHash('')
      setRequirement('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  async function hashUrl(raw: string, onHash: (hash: string) => void) {
    try {
      const response = await fetch(evidenceUrl(raw))
      if (!response.ok) throw new Error(`Evidence fetch failed (${response.status}). The host must allow browser CORS.`)
      const blob = await response.blob()
      const contentType = blob.type.split(';')[0].toLowerCase()
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
        throw new Error('Evidence must be JPEG, PNG, or WebP.')
      }
      onHash(await sha256File(new File([blob], 'evidence', { type: blob.type })))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not hash evidence URL bytes. Enter the verified SHA-256 manually.')
    }
  }

  const requesterRole = Boolean(
    !wrongNetwork && wallet && caseData && wallet.toLowerCase() === caseData.requester.toLowerCase(),
  )
  const remediatorRole = Boolean(
    !wrongNetwork && wallet && caseData && wallet.toLowerCase() === caseData.remediator.toLowerCase(),
  )
  const stepIndex = Math.max(0, FLOW.indexOf(caseData?.status ?? 'DRAFT'))
  const explorerTx = txHash ? `${EXPLORER}/tx/${txHash}` : ''

  const value: Ctx = {
    wallet,
    client,
    caseId: caseIdState,
    caseData,
    items,
    busy,
    loading,
    wrongNetwork,
    error,
    notice,
    txHash,
    live,
    contractLabel,
    explorerAddress,
    explorerTx,
    requesterRole,
    remediatorRole,
    stepIndex,
    title,
    remediator,
    label,
    defect,
    baselineUrl,
    baselineHash,
    requirement,
    completionUrls,
    completionHashes,
    setTitle,
    setRemediator,
    setLabel,
    setDefect,
    setBaselineUrl,
    setBaselineHash,
    setRequirement,
    setCompletionUrls,
    setCompletionHashes,
    setCaseId,
    setError,
    connect,
    disconnect,
    switchNetwork,
    refresh,
    transact,
    createCase,
    addItem,
    hashUrl,
  }

  return <WearlineContext.Provider value={value}>{children}</WearlineContext.Provider>
}

export function useWearline() {
  const context = useContext(WearlineContext)
  if (!context) throw new Error('useWearline must be used within WearlineProvider')
  return context
}
