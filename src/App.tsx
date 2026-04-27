import { useState } from 'react'
import { JobProvider } from '@/context/JobContext'
import { Layout } from '@/components/layout/Layout'
import { DashboardPage } from '@/pages/DashboardPage'
import { JobsPage } from '@/pages/JobsPage'
import { KanbanPage } from '@/pages/KanbanPage'
import { ResumePage } from '@/pages/ResumePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ClaireChat } from '@/components/ai/ClaireChat'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />
      case 'jobs': return <JobsPage />
      case 'kanban': return <KanbanPage />
      case 'resume': return <ResumePage />
      case 'settings': return <SettingsPage />
      default: return <DashboardPage />
    }
  }

  return (
    <JobProvider>
      <Layout activePage={activePage} onNavigate={setActivePage}>
        {renderPage()}
      </Layout>
      <ClaireChat />
    </JobProvider>
  )
}

export default App
