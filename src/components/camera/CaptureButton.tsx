import { Box, IconButton } from '@mui/material'

interface CaptureButtonProps {
  onCapture: () => void
  disabled?: boolean
}

/** Large circular shutter button matching the camera mockup. */
export default function CaptureButton({ onCapture, disabled }: CaptureButtonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
      <IconButton
        onClick={onCapture}
        disabled={disabled}
        aria-label="Tomar selfie"
        sx={{
          width: 76,
          height: 76,
          p: 0,
          border: '4px solid',
          borderColor: 'rgba(255,255,255,0.35)',
          '&:hover': { borderColor: 'primary.light' },
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffffff 0%, #cdbdff 100%)',
            boxShadow: (t) => `0 0 20px ${t.palette.primary.main}`,
          }}
        />
      </IconButton>
    </Box>
  )
}
