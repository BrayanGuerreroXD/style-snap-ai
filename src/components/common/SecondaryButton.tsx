import Button, { type ButtonProps } from '@mui/material/Button'

/** Outlined secondary action (e.g. "Volver a tomar"). */
export default function SecondaryButton(props: ButtonProps) {
  return <Button variant="outlined" color="inherit" fullWidth size="large" {...props} />
}
