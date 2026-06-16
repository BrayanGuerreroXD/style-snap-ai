import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import theme from './theme'
import { queryClient } from './queryClient'
import LandingPage from '@/pages/LandingPage'
import CreatorPage from '@/pages/CreatorPage'
import ResultPage from '@/pages/ResultPage'

// On GitHub Pages the app is served from /<repo>/; Vite injects the base path.
const basename = import.meta.env.BASE_URL

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/creator" element={<CreatorPage />} />
            <Route path="/result/:id" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
