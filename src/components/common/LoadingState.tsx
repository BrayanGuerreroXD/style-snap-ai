import { Box, LinearProgress, Typography } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

interface LoadingStateProps {
  label?: string
}

/** Full-bleed loading state with the gradient progress bar from the design system. */
export default function LoadingState({ label = 'Generando tu retrato…' }: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 4,
        minHeight: '60vh',
      }}
    >
      <AutoAwesomeIcon
        sx={{
          fontSize: 64,
          color: 'primary.light',
          animation: 'pulse 1.6s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5, transform: 'scale(0.95)' },
            '50%': { opacity: 1, transform: 'scale(1.05)' },
          },
        }}
      />
      <Typography variant="h3" sx={{ textAlign: 'center' }}>
        {label}
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 320 }}>
        <LinearProgress />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Esto puede tardar unos segundos
      </Typography>
    </Box>
  )
}
