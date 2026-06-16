import { Box, Typography } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useNavigate } from 'react-router-dom'
import MobileShell from '@/components/common/MobileShell'
import PrimaryButton from '@/components/common/PrimaryButton'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <MobileShell>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 3,
          minHeight: '100dvh',
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 72, color: 'primary.light' }} />
        <Typography variant="h1">
          Instant AI{' '}
          <Box component="span" sx={{ color: 'secondary.light' }}>
            Art
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 320 }}>
          Toma una selfie, elige un estilo y conviértete en arte en segundos.
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 320, mt: 2 }}>
          <PrimaryButton startIcon={<AutoAwesomeIcon />} onClick={() => navigate('/creator')}>
            Empezar
          </PrimaryButton>
        </Box>
      </Box>
    </MobileShell>
  )
}
