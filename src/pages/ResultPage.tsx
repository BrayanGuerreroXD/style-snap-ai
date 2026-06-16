import { Stack, Typography } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import MobileShell from '@/components/common/MobileShell'
import AppHeader from '@/components/common/AppHeader'
import PrimaryButton from '@/components/common/PrimaryButton'
import SecondaryButton from '@/components/common/SecondaryButton'
import ErrorState from '@/components/common/ErrorState'
import LoadingState from '@/components/common/LoadingState'
import ResultCard from '@/components/result/ResultCard'
import { getGeneration } from '@/services/generation'
import { downloadImage } from '@/utils/image'
import { STYLES_BY_ID } from '@/constants/styles'

export default function ResultPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['generation', id],
    queryFn: () => getGeneration(id),
    enabled: Boolean(id),
  })

  return (
    <MobileShell>
      <AppHeader onClose={() => navigate('/')} />
      {isPending ? (
        <LoadingState label="Cargando resultado…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography variant="h2" sx={{ textAlign: 'center', mt: 1 }}>
            Tu retrato
          </Typography>
          <ResultCard
            imageUrl={data.generatedUrl}
            styleName={STYLES_BY_ID[data.styleId]?.name ?? 'Estilo'}
          />
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <PrimaryButton
              startIcon={<DownloadIcon />}
              onClick={() => downloadImage(data.generatedUrl, `stylesnap-${data.id}.jpg`)}
            >
              Descargar
            </PrimaryButton>
            <SecondaryButton startIcon={<CameraAltIcon />} onClick={() => navigate('/creator')}>
              Crear otra
            </SecondaryButton>
          </Stack>
        </Stack>
      )}
    </MobileShell>
  )
}
