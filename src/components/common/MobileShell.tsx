import { Box } from '@mui/material'
import type { ReactNode } from 'react'

/** Centers content in a phone-width column; the app is mobile-first. */
export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          px: '20px', // container margin from the design system
          pb: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
