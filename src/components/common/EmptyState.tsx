import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        p: 4,
        minHeight: '50vh',
      }}
    >
      {icon}
      <Typography variant="h2">{title}</Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 320 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ width: '100%', maxWidth: 320, mt: 1 }}>{action}</Box>}
    </Box>
  )
}
