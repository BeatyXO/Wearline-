import { useEffect, useState } from 'react'
import { AppLayout } from './components/AppLayout'
import { WearlineProvider } from './context/WearlineContext'
import { CasePage } from './pages/CasePage'
import { EvidencePage } from './pages/EvidencePage'
import { HomePage } from './pages/HomePage'
import { ReportPage } from './pages/ReportPage'

function RoutedApp() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  let page
  if (path === '/case') page = <CasePage/>
  else if (path === '/evidence') page = <EvidencePage/>
  else if (path === '/report') page = <ReportPage/>
  else page = <HomePage/>

  return <AppLayout path={path}>{page}</AppLayout>
}

export default function App() {
  return <WearlineProvider><RoutedApp/></WearlineProvider>
}
