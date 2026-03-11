import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { TeamCreatePage } from '@/pages/TeamCreatePage'
import { TeamManagePage } from '@/pages/TeamManagePage'
import { TeamAssignPage } from '@/pages/TeamAssignPage'
import { TeamMemberAssignPage } from '@/pages/TeamMemberAssignPage'
import { DailyScrumWritePage } from '@/pages/DailyScrumWritePage'
import { ReportListPage } from '@/pages/ReportListPage'
import { TeamSharePage } from '@/pages/TeamSharePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DailyScrumWritePage />} />
          <Route path="/team/create" element={<TeamCreatePage />} />
          <Route path="/team/manage" element={<TeamManagePage />} />
          <Route path="/team/assign" element={<TeamAssignPage />} />
          <Route path="/team/members" element={<TeamMemberAssignPage />} />
          <Route path="/reports/:type" element={<ReportListPage />} />
          <Route path="/team/share" element={<TeamSharePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
