import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PageNotFound from './lib/PageNotFound'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import UserNotRegisteredError from '@/components/UserNotRegisteredError'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import SubjectDetail from './pages/SubjectDetail'
import Quiz from './pages/Quiz'
import LexIA from './pages/LexIA'
import VadeMecum from './pages/VadeMecum'
import PdfTools from './pages/PdfTools'
import Performance from './pages/Performance'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Landing from './pages/Landing'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth()

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subject-detail" element={<SubjectDetail />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/lexia" element={<LexIA />} />
        <Route path="/vademecum" element={<VadeMecum />} />
        <Route path="/pdf-tools" element={<PdfTools />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
