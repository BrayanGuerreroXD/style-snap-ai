import { Box } from '@mui/material'
import type { RefObject } from 'react'

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement>
}

/**
 * Front camera preview with the dashed oval face guide from the mockups.
 * The video is mirrored so it behaves like a selfie mirror.
 */
export default function CameraPreview({ videoRef }: CameraPreviewProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: 6,
        overflow: 'hidden',
        bgcolor: 'common.black',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        playsInline
        muted
        autoPlay
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
      />
      {/* Dashed oval face guide */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            width: '64%',
            height: '78%',
            border: '2px dashed',
            borderColor: 'secondary.light',
            borderRadius: '50%',
            opacity: 0.8,
          }}
        />
      </Box>
    </Box>
  )
}
