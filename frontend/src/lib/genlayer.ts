import { createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'
import { TransactionStatus } from 'genlayer-js/types'

export const CONTRACT_ADDRESS = import.meta.env.VITE_WEARLINE_CONTRACT_ADDRESS?.trim() as `0x${string}` | undefined
export const HAS_CONTRACT = Boolean(CONTRACT_ADDRESS)

export const STUDIONET_CHAIN_ID = '0xf22f'
export const STUDIONET_DECIMAL_CHAIN_ID = 61999

type InjectedProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

function provider(): InjectedProvider {
  if (!window.ethereum) throw new Error('No injected wallet detected.')
  return window.ethereum as InjectedProvider
}

export function readClient() {
  return createClient({ chain: studionet })
}

export function assertStudioNet(chainId: unknown) {
  const numeric = typeof chainId === 'string' ? Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10) : Number(chainId)
  if (numeric !== STUDIONET_DECIMAL_CHAIN_ID) throw new Error('GenLayer StudioNet (chain ID 61999) is required.')
}

function walletErrorCode(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) return Number((error as { code?: unknown }).code)
  return undefined
}

function walletErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error && 'message' in error) return String((error as { message?: unknown }).message ?? '')
  return String(error ?? '')
}

function isUnknownChain(error: unknown) {
  return walletErrorCode(error) === 4902 || /unknown chain|unrecognized chain|not added/i.test(walletErrorMessage(error))
}

function isUserRejected(error: unknown) {
  return walletErrorCode(error) === 4001 || /user rejected|user denied|rejected the request/i.test(walletErrorMessage(error))
}

export async function switchToStudioNet() {
  const injected = provider()
  try {
    await injected.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: STUDIONET_CHAIN_ID }] })
  } catch (error) {
    if (isUserRejected(error)) throw new Error('StudioNet 61999 is required to use Wearline. The network switch was cancelled.')
    if (!isUnknownChain(error)) throw error
    try {
      await injected.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: STUDIONET_CHAIN_ID,
          chainName: 'GenLayer StudioNet',
          rpcUrls: ['https://studio.genlayer.com/api'],
          nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
          blockExplorerUrls: ['https://explorer-studio.genlayer.com/'],
        }],
      })
      await injected.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: STUDIONET_CHAIN_ID }] })
    } catch (addError) {
      if (isUserRejected(addError)) throw new Error('StudioNet 61999 is required to use Wearline. Adding or switching the network was cancelled.')
      throw addError
    }
  }
}

export async function walletClientForAccount(address: string) {
  const client = createClient({
    chain: studionet,
    account: address as `0x${string}`,
    provider: window.ethereum as never,
  })
  await client.connect('studionet')
  return client
}

export async function connectWallet() {
  const injected = provider()
  const accounts = (await injected.request({ method: 'eth_requestAccounts' })) as string[]
  if (!accounts?.[0]) throw new Error('Wallet returned no account.')
  const chainId = await injected.request({ method: 'eth_chainId' })
  if (String(chainId).toLowerCase() !== STUDIONET_CHAIN_ID) await switchToStudioNet()
  const confirmedChainId = await injected.request({ method: 'eth_chainId' })
  assertStudioNet(confirmedChainId)
  const client = await walletClientForAccount(accounts[0])
  return { address: accounts[0] as `0x${string}`, client }
}

export async function restoreWallet() {
  if (!window.ethereum) return null
  const injected = provider()
  const accounts = (await injected.request({ method: 'eth_accounts' })) as string[]
  if (!accounts?.[0]) return null
  const chainId = await injected.request({ method: 'eth_chainId' })
  const onStudioNet = String(chainId).toLowerCase() === STUDIONET_CHAIN_ID
  if (!onStudioNet) return { address: accounts[0] as `0x${string}`, client: null, wrongNetwork: true }
  const client = await walletClientForAccount(accounts[0])
  return { address: accounts[0] as `0x${string}`, client, wrongNetwork: false }
}

export async function revokeWalletPermission() {
  if (!window.ethereum) return false
  try {
    await provider().request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] })
    return true
  } catch (error) {
    const code = walletErrorCode(error)
    const message = walletErrorMessage(error)
    if (code === -32601 || code === 4200 || /unsupported|not supported|method not found/i.test(message) || isUserRejected(error)) return false
    return false
  }
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
  // genlayer-js 1.1.8 exposes FINALIZED in its runtime enum and README but
  // omits it from the wait method's generated status union.
  const tx = await client.waitForTransactionReceipt({
    hash: txHash as never,
    status: TransactionStatus.FINALIZED as never,
    interval: 5_000,
    retries: 100,
  })
  const receipt = tx as {
    statusName?: string
    status_name?: string
    resultName?: string
    result_name?: string
    txExecutionResultName?: string
    tx_execution_result_name?: string
    consensus_data?: { leader_receipt?: Array<{ mode?: string; execution_result?: string }> }
  }
  const status = receipt.status_name ?? receipt.statusName
  const result = receipt.result_name ?? receipt.resultName
  const leaderResult = receipt.consensus_data?.leader_receipt?.find((entry) => entry.mode === 'leader')?.execution_result
  const execution = receipt.tx_execution_result_name ?? receipt.txExecutionResultName ?? leaderResult
  if (status !== 'FINALIZED') {
    throw new Error(`Transaction ${txHash} did not reach GenLayer finality (status: ${status ?? 'unknown'}).`)
  }
  if (result === 'FAILURE' || execution === 'ERROR' || execution === 'FINISHED_WITH_ERROR') {
    throw new Error(`Transaction ${txHash} failed during GenLayer execution.`)
  }
  if (execution !== 'SUCCESS' && execution !== 'FINISHED_WITH_RETURN') {
    throw new Error(`Transaction ${txHash} finalized without a successful contract execution result (execution: ${execution ?? 'unknown'}).`)
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
