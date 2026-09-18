import { createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'

export const CONTRACT_ADDRESS = import.meta.env.VITE_WEARLINE_CONTRACT_ADDRESS?.trim() as `0x${string}` | undefined
export const HAS_CONTRACT = Boolean(CONTRACT_ADDRESS)

export function readClient() {
  return createClient({ chain: studionet })
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error('No injected wallet detected.')
  const provider = window.ethereum as {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  }
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
  if (!accounts?.[0]) throw new Error('Wallet returned no account.')

  const client = createClient({
    chain: studionet,
    account: accounts[0] as `0x${string}`,
    provider: window.ethereum as never,
  })
  await client.connect('studionet')
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
    args,
    ...(value !== undefined ? { value } : {}),
  }

  const estimate = await (client as any).estimateTransactionFeesForWrite(call)
  const txHash = await (client as any).writeContract({
    ...call,
    fees: {
      distribution: estimate.distribution,
      feeValue: estimate.feeValue,
    },
  })
  return txHash as string
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
