import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'

interface AppHeaderProps {
  onClose?: () => void
}

/** Top bar with the brand mark; matches the Stitch mockups. */
export default function AppHeader({ onClose }: AppHeaderProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: 'primary.light' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            StyleSnap AI
          </Typography>
        </Box>
        {onClose && (
          <IconButton edge="end" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  )
}
