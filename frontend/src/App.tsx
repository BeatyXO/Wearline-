import { useEffect, useState } from 'react'
import { AppLayout } from './components/AppLayout'
import { WearlineProvider } from './context/WearlineContext'
import { AgreementPage } from './pages/AgreementPage'
import { EvidencePage } from './pages/EvidencePage'
import { HomePage } from './pages/HomePage'
import { SettlementPage } from './pages/SettlementPage'

function RoutedApp(){
  const [path,setPath]=useState(window.location.pathname)
  useEffect(()=>{
    const onPop=()=>setPath(window.location.pathname)
    window.addEventListener('popstate',onPop)
    return ()=>window.removeEventListener('popstate',onPop)
  },[])
  let page
  if(path==='/agreement') page=<AgreementPage/>
  else if(path==='/evidence') page=<EvidencePage/>
  else if(path==='/settlement') page=<SettlementPage/>
  else page=<HomePage/>
  return <AppLayout path={path}>{page}</AppLayout>
}

export default function App(){
  return <WearlineProvider><RoutedApp/></WearlineProvider>
}
