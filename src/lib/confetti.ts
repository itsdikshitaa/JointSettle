'use client'

import confetti from 'canvas-confetti'

export function fireCreateConfetti() {
  // Fire from left
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { x: 0.2, y: 0.6 },
    colors: ['#3B82F6', '#6366F1', '#10B981', '#8B5CF6', '#F59E0B'],
    ticks: 100,
  })
  // Fire from right
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { x: 0.8, y: 0.6 },
    colors: ['#3B82F6', '#6366F1', '#10B981', '#8B5CF6', '#F59E0B'],
    ticks: 100,
  })
}

export function fireSuccessConfetti() {
  confetti({
    particleCount: 30,
    spread: 40,
    origin: { x: 0.5, y: 0.4 },
    colors: ['#10B981', '#3B82F6', '#6366F1'],
    ticks: 80,
  })
}
