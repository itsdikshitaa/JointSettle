/**
 * One-time backfill script: links legacy Participant records to their owning User.
 *
 * Participants created before the `hash` field existed have `hash = null`.
 * This script backfills them by:
 *
 *   1. Setting `hash` to the group owner's hash for the first participant
 *      in each group (convention: first participant = group creator).
 *   2. Matching participants to JoinRequest records by name (case-insensitive)
 *      within the same group and setting their hash.
 *
 * Usage:
 *   npx tsx prisma/backfill-hashes.ts
 *
 * This script is idempotent — it will not overwrite existing hashes.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting participant hash backfill...')

  // Count participants without a hash
  const totalNull = await prisma.participant.count({ where: { hash: null } })
  console.log(`Participants without a hash: ${totalNull}`)

  if (totalNull === 0) {
    console.log('Nothing to backfill.')
    return
  }

  let updated = 0

  // --- Step 1: First participant in each group → group owner's hash ---
  const groups = await prisma.group.findMany({
    include: {
      user: { select: { hash: true } },
      participants: {
        where: { hash: null },
        orderBy: { joinedAt: 'asc' },
        take: 1,
      },
    },
  })

  for (const group of groups) {
    const firstParticipant = group.participants[0]
    if (!firstParticipant) continue
    if (!group.user.hash) continue // should never happen

    await prisma.participant.update({
      where: { id: firstParticipant.id },
      data: { hash: group.user.hash },
    })
    updated++
  }

  console.log(`Step 1 (group owner backfill): ${updated} participants updated`)

  // --- Step 2: Match remaining null-hash participants to JoinRequest records ---
  const nullParticipants = await prisma.participant.findMany({
    where: { hash: null },
    select: { id: true, name: true, groupId: true },
  })

  for (const participant of nullParticipants) {
    // Find an approved join request in the same group with a matching name
    const joinRequest = await prisma.joinRequest.findFirst({
      where: {
        groupId: participant.groupId,
        name: { equals: participant.name, mode: 'insensitive' },
        status: 'approved',
      },
      select: { hash: true },
    })

    if (joinRequest?.hash) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: { hash: joinRequest.hash },
      })
      updated++
    }
  }

  console.log(`Step 2 (join request backfill): total updated so far: ${updated}`)

  // --- Summary ---
  const remaining = await prisma.participant.count({ where: { hash: null } })
  console.log(`Backfill complete. Remaining participants without hash: ${remaining}`)
  console.log(`Total participants updated: ${updated}`)

  if (remaining > 0) {
    console.log(
      'Note: Some participants could not be automatically linked. ' +
        'These may be legacy participants whose names do not match any approved join request.',
    )
  }
}

main()
  .catch((e) => {
    console.error('Backfill failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
