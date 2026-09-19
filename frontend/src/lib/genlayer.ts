import { createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'

export const CONTRACT_ADDRESS = import.meta.env.VITE_WEARLINE_CONTRACT_ADDRESS?.trim() as `0x${string}` | undefined
export const HAS_CONTRACT = Boolean(CONTRACT_ADDRESS)

export function readClient() {
  return createClient({ chain: studionet })
}

export function assertStudioNet(chainId: unknown) {
  const numeric = typeof chainId === 'string' ? Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10) : Number(chainId)
  if (numeric !== 61999) throw new Error('Switch your wallet to GenLayer StudioNet (chain ID 61999).')
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error('No injected wallet detected.')
  const provider = window.ethereum as {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  }
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
  if (!accounts?.[0]) throw new Error('Wallet returned no account.')
  const chainId = await provider.request({ method: 'eth_chainId' })
  assertStudioNet(chainId)

  const client = createClient({
    chain: studionet,
    account: accounts[0] as `0x${string}`,
    provider: window.ethereum as never,
  })
  return { address: accounts[0] as `0x${string}`, client }
}

export async function writeWearline(
  client: ReturnType<typeof createClient>,
  functionName: string,
  args: unknown[],
  value?: bigint,
) {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address is not configured yet.')

  const call = {
    address: CONTRACT_ADDRESS,
    functionName,
    args: args as never[],
    ...(value !== undefined ? { value } : {}),
  }

  const txHash = await client.writeContract({
    ...call,
    value: value ?? 0n,
  }) as string
  await waitForWearlineTransaction(client, txHash)
  return txHash
}

export async function readWearline(client: ReturnType<typeof createClient>, functionName: string, args: unknown[] = []) {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address is not configured yet.')
  return client.readContract({ address: CONTRACT_ADDRESS, functionName, args: args as never[], jsonSafeReturn: true })
}

export async function waitForWearlineTransaction(client: ReturnType<typeof createClient>, txHash: string) {
  const tx = await client.waitForTransactionReceipt({ hash: txHash as never })
  const receipt = tx as { status?: string | number; executionResult?: string | number; result?: string | number }
  const terminal = [receipt.status, receipt.executionResult, receipt.result].map((value) => String(value ?? '').toLowerCase())
  if (terminal.some((state) => ['failed', 'revert', 'reverted', 'rejected', 'error', '3', '4'].includes(state))) {
    throw new Error(`Transaction ${txHash} failed during GenLayer execution.`)
  }
  return tx
}

export function shortAddress(value?: string) {
  if (!value) return 'Not connected'
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

export function formatGen(value: bigint) {
  const whole = value / 10n ** 18n
  const fraction = ((value % 10n ** 18n) * 100n) / 10n ** 18n
  return `${whole}.${fraction.toString().padStart(2, '0')} GEN`
}
