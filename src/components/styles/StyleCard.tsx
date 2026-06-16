import { Box, Card, CardActionArea, Chip, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { Style } from '@/constants/styles'

interface StyleCardProps {
  style: Style
  selected: boolean
  onSelect: (id: string) => void
}

/**
 * Selectable style card. Selected state shows a 3px primary border + a "Selected"
 * chip, matching the Stitch style-selection mockup.
 */
export default function StyleCard({ style, selected, onSelect }: StyleCardProps) {
  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 4,
        borderWidth: selected ? 3 : 1,
        borderStyle: 'solid',
        borderColor: selected ? 'primary.main' : 'divider',
        transition: 'border-color 0.15s ease',
      }}
    >
      <CardActionArea
        onClick={() => onSelect(style.id)}
        sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5 }}
      >
        <Box
          component="span"
          sx={{ fontSize: 28, lineHeight: 1 }}
          role="img"
          aria-label={style.name}
        >
          {style.icon}
        </Box>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h3" sx={{ fontSize: '1.1rem' }}>
            {style.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {style.tagline}
          </Typography>
        </Box>
        {selected && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
            label="Elegido"
            size="small"
            color="primary"
            sx={{ position: 'absolute', top: 12, right: 12 }}
          />
        )}
      </CardActionArea>
    </Card>
  )
}
