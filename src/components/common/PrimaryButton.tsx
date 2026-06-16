import Button, { type ButtonProps } from '@mui/material/Button'

/** Full-width gradient CTA (the "Generate" button style from the mockups). */
export default function PrimaryButton(props: ButtonProps) {
  return <Button variant="contained" color="primary" fullWidth size="large" {...props} />
}
