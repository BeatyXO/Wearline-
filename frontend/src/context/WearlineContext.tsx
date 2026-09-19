import { FormEvent, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { assertStudioNet, connectWallet, CONTRACT_ADDRESS, HAS_CONTRACT, readClient, readWearline, restoreWallet, revokeWalletPermission, shortAddress, STUDIONET_CHAIN_ID, switchToStudioNet, walletClientForAccount, writeWearline } from '../lib/genlayer'
import { sha256File } from '../lib/hash'

export type Raw = Record<string, unknown>
export type Item = { index:number; label:string; baseline_url:string; baseline_sha256:string; max_deduction:bigint; checkout_url:string; checkout_sha256:string; classification:string; severity:number; deduction:bigint; rationale:string; adjudicated:boolean; waived:boolean }
export type Agreement = { id:string; owner:string; renter:string; property_label:string; deposit_required:bigint; deposit_funded:bigint; policy_text:string; status:string; item_count:number; adjudicated_count:number; total_deduction:bigint; sealed:boolean }

export const FLOW = ['DRAFT','SEALED','FUNDED','REVIEWING','READY_TO_SETTLE','SETTLED']
export const EXPLORER = 'https://explorer-studio.genlayer.com'
export const POLICY_DEFAULT = 'Normal wear includes light scuffs and gradual cosmetic aging from ordinary residential use. New cracks, breaks, burns, missing parts, deep gouges, or material deformation are damage.'
const str=(v:unknown)=>String(v ?? '')
const num=(v:unknown)=>Number(v ?? 0)

export function parseGen(value:string):bigint {
  const match=value.trim().match(/^(\d+)(?:\.(\d{1,18}))?$/)
  if(!match) throw new Error('Enter a valid GEN amount with up to 18 decimal places.')
  return BigInt(match[1])*10n**18n+BigInt((match[2]??'').padEnd(18,'0')||'0')
}
export function gen(value:bigint) {
  const whole=value/10n**18n
  const frac=(value%10n**18n).toString().padStart(18,'0').replace(/0+$/,'')
  return `${whole}${frac?`.${frac}`:''} GEN`
}
export function evidenceUrl(value:string) {
  if(!/^https:\/\//i.test(value.trim())) throw new Error('Evidence URL must use HTTPS.')
  return value.trim()
}
export function digest(value:string) {
  const d=value.trim().toLowerCase()
  if(!/^[a-f0-9]{64}$/.test(d)) throw new Error('SHA-256 must contain exactly 64 hexadecimal characters.')
  return d
}

type Ctx = {
  wallet:string; client:any; agreementId:string; agreement:Agreement|null; items:Item[]; busy:boolean; loading:boolean; wrongNetwork:boolean;
  error:string; notice:string; txHash:string; live:boolean; contractLabel:string; explorerAddress:string; explorerTx:string;
  owner:boolean; renterRole:boolean; party:boolean; unresolved:number; stepIndex:number;
  property:string; renter:string; deposit:string; policy:string; label:string; baselineUrl:string; baselineHash:string; cap:string;
  checkoutUrls:Record<number,string>; checkoutHashes:Record<number,string>;
  setProperty:(v:string)=>void; setRenter:(v:string)=>void; setDeposit:(v:string)=>void; setPolicy:(v:string)=>void;
  setLabel:(v:string)=>void; setBaselineUrl:(v:string)=>void; setBaselineHash:(v:string)=>void; setCap:(v:string)=>void;
  setCheckoutUrls:(v:Record<number,string>)=>void; setCheckoutHashes:(v:Record<number,string>)=>void;
  setAgreementId:(v:string)=>void; setError:(v:string)=>void;
  connect:()=>Promise<void>; disconnect:()=>Promise<void>; switchNetwork:()=>Promise<void>;
  refresh:(id?:string, activeClient?:any)=>Promise<void>; transact:(name:string,args:unknown[],value?:bigint)=>Promise<string|undefined>;
  createAgreement:(e:FormEvent)=>Promise<void>; addItem:(e:FormEvent)=>Promise<void>; hashUrl:(raw:string,onHash:(s:string)=>void)=>Promise<void>;
}

const WearlineContext=createContext<Ctx|null>(null)

export function WearlineProvider({children}:{children:ReactNode}) {
  const initialId = new URLSearchParams(window.location.search).get('id')?.replace(/\D/g,'') ?? ''
  const [wallet,setWallet]=useState(''), [client,setClient]=useState<ReturnType<typeof readClient>|any>(null)
  const [wrongNetwork,setWrongNetwork]=useState(false)
  const [agreementIdState,setAgreementIdState]=useState(initialId),[agreement,setAgreement]=useState<Agreement|null>(null),[items,setItems]=useState<Item[]>([])
  const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[txHash,setTxHash]=useState('')
  const [property,setProperty]=useState(''),[renter,setRenter]=useState(''),[deposit,setDeposit]=useState(''),[policy,setPolicy]=useState(POLICY_DEFAULT)
  const [label,setLabel]=useState(''),[baselineUrl,setBaselineUrl]=useState(''),[baselineHash,setBaselineHash]=useState(''),[cap,setCap]=useState('')
  const [checkoutUrls,setCheckoutUrls]=useState<Record<number,string>>({}),[checkoutHashes,setCheckoutHashes]=useState<Record<number,string>>({})
  const locked=useRef(false)
  const live=HAS_CONTRACT
  const contractLabel=useMemo(()=>CONTRACT_ADDRESS?shortAddress(CONTRACT_ADDRESS):'Contract not configured',[])
  const explorerAddress=CONTRACT_ADDRESS?`${EXPLORER}/address/${CONTRACT_ADDRESS}`:'#'

  const clearWalletState=useCallback(()=>{
    setWallet('');setClient(null);setWrongNetwork(false);setAgreement(null);setItems([]);setTxHash('')
  },[])

  const setAgreementId=useCallback((value:string)=>{
    const id=value.replace(/\D/g,'')
    setAgreementIdState(id); setAgreement(null); setItems([])
    const next=new URL(window.location.href)
    if(id) next.searchParams.set('id',id); else next.searchParams.delete('id')
    window.history.replaceState({},'',next)
  },[])

  const refresh=useCallback(async(id=agreementIdState, activeClient=client)=>{
    if(!live||!id||!activeClient) return
    setLoading(true);setError('')
    try {
      const raw=await readWearline(activeClient,'get_agreement',[id]) as Raw
      const a:Agreement={id,owner:str(raw.owner),renter:str(raw.renter),property_label:str(raw.property_label),deposit_required:BigInt(str(raw.deposit_required)),deposit_funded:BigInt(str(raw.deposit_funded)),policy_text:str(raw.policy_text),status:str(raw.status),item_count:num(raw.item_count),adjudicated_count:num(raw.adjudicated_count),total_deduction:BigInt(str(raw.total_deduction)),sealed:Boolean(raw.sealed)}
      const fetched:Item[]=[]
      for(let i=0;i<a.item_count;i++) {
        const r=await readWearline(activeClient,'get_item',[id,i]) as Raw
        fetched.push({index:i,label:str(r.label),baseline_url:str(r.baseline_url),baseline_sha256:str(r.baseline_sha256),max_deduction:BigInt(str(r.max_deduction)),checkout_url:str(r.checkout_url),checkout_sha256:str(r.checkout_sha256),classification:str(r.classification),severity:num(r.severity),deduction:BigInt(str(r.deduction)),rationale:str(r.rationale),adjudicated:Boolean(r.adjudicated),waived:Boolean(r.waived)})
      }
      setAgreement(a);setItems(fetched);setNotice('Agreement data refreshed from StudioNet.')
    } catch(e) { setAgreement(null);setItems([]);setError(e instanceof Error?e.message:'Unable to load agreement from StudioNet.') }
    finally { setLoading(false) }
  },[agreementIdState,client,live])

  useEffect(()=>{ if(client&&agreementIdState&&!wrongNetwork) void refresh(agreementIdState,client) },[client,agreementIdState,wrongNetwork,refresh])

  useEffect(()=>{
    let active=true
    void (async()=>{
      try {
        const restored=await restoreWallet()
        if(!active||!restored) return
        setWallet(restored.address);setClient(restored.client);setWrongNetwork(restored.wrongNetwork)
        if(restored.wrongNetwork) setNotice('Wallet restored. Switch to GenLayer StudioNet 61999 to continue.')
      } catch(e) {
        if(active) setError(e instanceof Error?e.message:'Unable to restore the authorised wallet session.')
      }
    })()
    return ()=>{active=false}
  },[])

  useEffect(()=>{
    const provider=window.ethereum as {
      request?:(args:{method:string;params?:unknown[]})=>Promise<unknown>
      on?:(name:string,cb:(v:unknown)=>void)=>void
      removeListener?:(name:string,cb:(v:unknown)=>void)=>void
    }|undefined

    const accounts=async(value:unknown)=>{
      const address=Array.isArray(value)?str(value[0]):''
      if(!address){clearWalletState();setNotice('Wallet disconnected from Wearline.');return}
      setWallet(address);setError('')
      try {
        const chainId=await provider?.request?.({method:'eth_chainId'})
        if(String(chainId).toLowerCase()!==STUDIONET_CHAIN_ID){
          setClient(null);setWrongNetwork(true);setNotice('Wallet account changed. Switch to GenLayer StudioNet 61999 to continue.');return
        }
        const nextClient=await walletClientForAccount(address)
        setClient(nextClient);setWrongNetwork(false);setNotice('Wallet account updated on StudioNet 61999.')
      } catch(e){setClient(null);setError(e instanceof Error?e.message:'Unable to restore the changed wallet account.')}
    }

    const chain=async(value:unknown)=>{
      if(!wallet) return
      if(String(value).toLowerCase()!==STUDIONET_CHAIN_ID){
        setClient(null);setWrongNetwork(true);setError('');setNotice('Wallet is connected, but GenLayer StudioNet 61999 is required.')
        return
      }
      try {
        const nextClient=await walletClientForAccount(wallet)
        setClient(nextClient);setWrongNetwork(false);setError('');setNotice('Back on GenLayer StudioNet 61999.')
      } catch(e){setClient(null);setError(e instanceof Error?e.message:'Unable to reconnect to StudioNet.')}
    }

    provider?.on?.('accountsChanged',accounts);provider?.on?.('chainChanged',chain)
    return ()=>{provider?.removeListener?.('accountsChanged',accounts);provider?.removeListener?.('chainChanged',chain)}
  },[wallet,clearWalletState])

  async function connect(){setError('');try{const c=await connectWallet();setWallet(c.address);setClient(c.client);setWrongNetwork(false);setNotice('Wallet connected to StudioNet 61999.')}catch(e){setError(e instanceof Error?e.message:'Wallet connection failed.')}}

  async function switchNetwork(){setError('');try{
    if(!wallet) throw new Error('Connect a wallet first.')
    await switchToStudioNet()
    const nextClient=await walletClientForAccount(wallet)
    setClient(nextClient);setWrongNetwork(false);setNotice('Connected to GenLayer StudioNet 61999.')
  }catch(e){setError(e instanceof Error?e.message:'Unable to switch to StudioNet.')}}

  async function disconnect(){
    setError('')
    const revoked=await revokeWalletPermission()
    clearWalletState()
    setNotice(revoked?'Wallet permission revoked and Wearline disconnected.':'Wearline disconnected locally. Your wallet may still list this site as authorised.')
  }

  async function transact(name:string,args:unknown[],value?:bigint){
    if(!client||wrongNetwork) throw new Error('GenLayer StudioNet 61999 is required before continuing.')
    if(locked.current) return
    locked.current=true;setBusy(true);setError('');setNotice('');setTxHash('')
    try{
      const provider=window.ethereum as {request:(a:{method:string})=>Promise<unknown>}|undefined
      if(!provider) throw new Error('No injected wallet detected.')
      assertStudioNet(await provider.request({method:'eth_chainId'}))
      const accounts=await provider.request({method:'eth_accounts'}) as string[]
      if(!accounts?.[0]||accounts[0].toLowerCase()!==wallet.toLowerCase()) throw new Error('The connected wallet account changed. Reconnect before sending a transaction.')
      const hash=await writeWearline(client,name,args,value);setTxHash(hash);setNotice(`${name} finalized successfully on StudioNet.`)
      if(agreementIdState) await refresh(agreementIdState,client)
      return hash
    } catch(e){const message=e instanceof Error?e.message:String(e);const match=message.match(/0x[a-fA-F0-9]{64}/);if(match)setTxHash(match[0]);throw e}
    finally{locked.current=false;setBusy(false)}
  }
  async function createAgreement(e:FormEvent){e.preventDefault();try{
    const provider=window.ethereum as {request:(a:{method:string})=>Promise<unknown>}|undefined
    if(!provider) throw new Error('No injected wallet detected.')
    assertStudioNet(await provider.request({method:'eth_chainId'}))
    const value=parseGen(deposit);if(!/^0x[a-fA-F0-9]{40}$/.test(renter))throw new Error('Enter a valid renter address.')
    const id=str(await readWearline(client,'get_next_agreement_id',[]))
    await transact('create_agreement',[renter,property,value,policy]);setAgreementId(id);setNotice(`Agreement #${id} created and finalized.`)
  }catch(e){setError(e instanceof Error?e.message:String(e))}}
  async function addItem(e:FormEvent){e.preventDefault();try{
    const value=parseGen(cap);if(value<=0n)throw new Error('Item cap must be greater than zero.')
    const frozen=items.reduce((sum,item)=>sum+item.max_deduction,0n);if(agreement&&frozen+value>agreement.deposit_required)throw new Error('Item caps cannot exceed the frozen deposit.')
    await transact('add_item',[agreementIdState,label,evidenceUrl(baselineUrl),digest(baselineHash),value]);setLabel('');setBaselineUrl('');setBaselineHash('');setCap('')
  }catch(e){setError(e instanceof Error?e.message:String(e))}}
  async function hashUrl(raw:string,onHash:(s:string)=>void){try{
    const response=await fetch(evidenceUrl(raw));if(!response.ok)throw new Error(`Evidence fetch failed (${response.status}). The host must allow browser CORS.`)
    const blob=await response.blob();if(!['image/jpeg','image/png','image/webp'].includes(blob.type.split(';')[0].toLowerCase()))throw new Error('Evidence must be JPEG, PNG, or WebP.')
    onHash(await sha256File(new File([blob],'evidence',{type:blob.type})))
  }catch(e){setError(e instanceof Error?e.message:'Could not hash evidence URL bytes. Enter the verified SHA-256 manually.')}}

  const owner=Boolean(!wrongNetwork&&wallet&&agreement&&wallet.toLowerCase()===agreement.owner.toLowerCase())
  const renterRole=Boolean(!wrongNetwork&&wallet&&agreement&&wallet.toLowerCase()===agreement.renter.toLowerCase())
  const party=owner||renterRole
  const unresolved=items.filter(i=>i.classification==='INCONCLUSIVE'&&!i.waived).length
  const stepIndex=Math.max(0,FLOW.indexOf(agreement?.status??'DRAFT'))
  const explorerTx=txHash?`${EXPLORER}/tx/${txHash}`:''
  const value={wallet,client,agreementId:agreementIdState,agreement,items,busy,loading,wrongNetwork,error,notice,txHash,live,contractLabel,explorerAddress,explorerTx,owner,renterRole,party,unresolved,stepIndex,property,renter,deposit,policy,label,baselineUrl,baselineHash,cap,checkoutUrls,checkoutHashes,setProperty,setRenter,setDeposit,setPolicy,setLabel,setBaselineUrl,setBaselineHash,setCap,setCheckoutUrls,setCheckoutHashes,setAgreementId,setError,connect,disconnect,switchNetwork,refresh,transact,createAgreement,addItem,hashUrl}
  return <WearlineContext.Provider value={value}>{children}</WearlineContext.Provider>
}
export function useWearline(){const ctx=useContext(WearlineContext);if(!ctx)throw new Error('useWearline must be used within WearlineProvider');return ctx}
