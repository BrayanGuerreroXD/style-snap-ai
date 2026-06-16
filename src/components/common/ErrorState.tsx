import { Box, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import PrimaryButton from './PrimaryButton'
import type { AppError, AppErrorCode } from '@/types/generation'

const MESSAGES: Record<AppErrorCode, string> = {
  'camera-denied': 'No pudimos acceder a la cámara. Revisa los permisos del navegador.',
  'invalid-capture': 'La captura no fue válida. Intenta tomar la selfie de nuevo.',
  'generation-timeout': 'La generación tardó demasiado. Inténtalo otra vez.',
  'gemini-error': 'Hubo un problema generando tu imagen. Inténtalo de nuevo.',
  'storage-error': 'No pudimos guardar la imagen. Inténtalo de nuevo.',
  'network-error': 'Sin conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
  'not-found': 'No encontramos este resultado.',
  unknown: 'Algo salió mal. Inténtalo de nuevo.',
}

interface ErrorStateProps {
  error: AppError | Error | null
  onRetry?: () => void
  retryLabel?: string
}

export default function ErrorState({ error, onRetry, retryLabel = 'Reintentar' }: ErrorStateProps) {
  const code = (error as AppError)?.code as AppErrorCode | undefined
  const message = (code && MESSAGES[code]) || error?.message || MESSAGES.unknown

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
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 56, color: 'error.main' }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      {onRetry && (
        <Box sx={{ width: '100%', maxWidth: 320, mt: 1 }}>
          <PrimaryButton onClick={onRetry}>{retryLabel}</PrimaryButton>
        </Box>
      )}
    </Box>
  )
}
