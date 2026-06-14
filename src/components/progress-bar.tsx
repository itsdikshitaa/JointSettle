'use client'
import { Next13ProgressBar } from 'next13-progressbar'

export function ProgressBar() {
  return (
    <Next13ProgressBar
      height="3px"
      color="#059669"
      options={{ showSpinner: false }}
      showOnShallow
    />
  )
}
