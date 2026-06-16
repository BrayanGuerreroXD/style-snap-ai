import { Box, Card, Chip } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

interface ResultCardProps {
  imageUrl: string
  styleName: string
}

/** Large result card showing the generated portrait with a style chip overlay. */
export default function ResultCard({ imageUrl, styleName }: ResultCardProps) {
  return (
    <Card sx={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
      <Box
        component="img"
        src={imageUrl}
        alt={`Retrato estilo ${styleName}`}
        sx={{ display: 'block', width: '100%', aspectRatio: '3 / 4', objectFit: 'cover' }}
      />
      <Chip
        icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
        label={styleName}
        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 600 }}
      />
    </Card>
  )
}
