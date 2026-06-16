import { useEffect, useRef, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import { useNavigate } from 'react-router-dom'

import MobileShell from '@/components/common/MobileShell'
import AppHeader from '@/components/common/AppHeader'
import PrimaryButton from '@/components/common/PrimaryButton'
import SecondaryButton from '@/components/common/SecondaryButton'
import ErrorState from '@/components/common/ErrorState'
import LoadingState from '@/components/common/LoadingState'
import CameraPreview from '@/components/camera/CameraPreview'
import CaptureButton from '@/components/camera/CaptureButton'
import StyleCard from '@/components/styles/StyleCard'
import ResultCard from '@/components/result/ResultCard'

import { useCamera } from '@/hooks/useCamera'
import { useStyleSelection } from '@/hooks/useRandomStyles'
import { useGenerateImage } from '@/hooks/useGenerateImage'
import { captureFrame, downloadImage } from '@/utils/image'
import { STYLES_BY_ID } from '@/constants/styles'
import { AppError } from '@/types/generation'

type Step = 'camera' | 'styles' | 'result'

export default function CreatorPage() {
  const navigate = useNavigate()
  const { videoRef, status, error: cameraError, start, stop } = useCamera()
  const { styles, reshuffle } = useStyleSelection()
  const generate = useGenerateImage()

  const [step, setStep] = useState<Step>('camera')
  const [capture, setCapture] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [captureError, setCaptureError] = useState<AppError | null>(null)
  const startedRef = useRef(false)

  // Start the camera once when entering the camera step.
  useEffect(() => {
    if (step === 'camera' && !startedRef.current) {
      startedRef.current = true
      void start()
    }
  }, [step, start])

  const handleCapture = () => {
    const video = videoRef.current
    if (!video) return
    try {
      const dataUrl = captureFrame(video)
      setCapture(dataUrl)
      stop()
      reshuffle()
      setSelectedStyle(null)
      setCaptureError(null)
      setStep('styles')
    } catch {
      setCaptureError(new AppError('invalid-capture', 'No se pudo capturar la imagen.'))
    }
  }

  const handleGenerate = () => {
    if (!capture || !selectedStyle) return
    generate.mutate(
      { image: capture, styleId: selectedStyle },
      { onSuccess: () => setStep('result') },
    )
  }

  const retake = () => {
    generate.reset()
    setCapture(null)
    setSelectedStyle(null)
    setCaptureError(null)
    startedRef.current = false
    setStep('camera')
  }

  const result = generate.data

  return (
    <MobileShell>
      <AppHeader onClose={() => navigate('/')} />

      {/* CAMERA STEP */}
      {step === 'camera' && (
        <Stack spacing={3} sx={{ flex: 1, justifyContent: 'center' }}>
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            Take your selfie
          </Typography>

          {cameraError ? (
            <ErrorState error={cameraError} onRetry={() => void start()} retryLabel="Permitir cámara" />
          ) : (
            <>
              <CameraPreview videoRef={videoRef} />
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Coloca tu rostro dentro del óvalo
              </Typography>
              {captureError && <ErrorState error={captureError} />}
              <CaptureButton onCapture={handleCapture} disabled={status !== 'ready'} />
            </>
          )}
        </Stack>
      )}

      {/* STYLES STEP */}
      {step === 'styles' && (
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="h2">Choose your transformation</Typography>
            <Typography variant="body2" color="text.secondary">
              3 estilos aleatorios para ti
            </Typography>
          </Box>

          {generate.isPending ? (
            <LoadingState />
          ) : generate.isError ? (
            <ErrorState error={generate.error} onRetry={handleGenerate} />
          ) : (
            <>
              <Stack spacing={1.5} sx={{ flex: 1 }}>
                {styles.map((s) => (
                  <StyleCard
                    key={s.id}
                    style={s}
                    selected={selectedStyle === s.id}
                    onSelect={setSelectedStyle}
                  />
                ))}
              </Stack>
              <Stack spacing={1.5} sx={{ position: 'sticky', bottom: 16, pt: 1 }}>
                <PrimaryButton
                  startIcon={<CameraAltIcon />}
                  disabled={!selectedStyle}
                  onClick={handleGenerate}
                >
                  Generar
                </PrimaryButton>
                <SecondaryButton startIcon={<RefreshIcon />} onClick={retake}>
                  Volver a tomar
                </SecondaryButton>
              </Stack>
            </>
          )}
        </Stack>
      )}

      {/* RESULT STEP */}
      {step === 'result' && result && (
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography variant="h2" sx={{ textAlign: 'center', mt: 1 }}>
            ¡Listo!
          </Typography>
          <ResultCard
            imageUrl={result.generatedUrl}
            styleName={STYLES_BY_ID[result.styleId]?.name ?? 'Estilo'}
          />
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <PrimaryButton
              startIcon={<DownloadIcon />}
              onClick={() => downloadImage(result.generatedUrl, `stylesnap-${result.id}.jpg`)}
            >
              Descargar
            </PrimaryButton>
            <SecondaryButton startIcon={<RefreshIcon />} onClick={retake}>
              Volver a tomar
            </SecondaryButton>
          </Stack>
        </Stack>
      )}
    </MobileShell>
  )
}
