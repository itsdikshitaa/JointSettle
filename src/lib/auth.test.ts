import { generateHash, createUser, getUserByHash, verifyGroupOwnership } from './auth'
import { createGroup } from './api'

// Use relative path for jest.mock (moduleNameMapper does not apply to mock factories)
jest.mock('./prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    group: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Import after the mock is registered so both the import and the mock refer to the same module
import { prisma } from './prisma'

// Mock nanoid so randomId() returns predictable values
jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('mocked-id-xxx'),
}))

const mockUser = { id: 'user-1', hash: 'abc12345', createdAt: new Date() }
const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  userId: 'user-1',
  participants: [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
  ],
}

// ---------------------------------------------------------------------------
// generateHash
// ---------------------------------------------------------------------------
describe('generateHash', () => {
  it('returns an 8-character string', () => {
    const hash = generateHash()
    expect(hash).toHaveLength(8)
  })

  it('contains only alphanumeric characters', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateHash()).toMatch(/^[A-Za-z0-9]{8}$/)
    }
  })

  it('produces unique values across multiple calls', () => {
    const hashes = new Set(Array.from({ length: 100 }, () => generateHash()))
    expect(hashes.size).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// createUser
// ---------------------------------------------------------------------------
describe('createUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a user when no hash collision occurs', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)

    const result = await createUser()

    expect(result).toEqual({ id: 'user-1', hash: 'abc12345' })
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'mocked-id-xxx',
        hash: expect.stringMatching(/^[A-Za-z0-9]{8}$/),
      }),
    })
  })

  it('retries hash generation when a collision occurs', async () => {
    // First lookup finds a user (collision), second returns null (unique)
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'existing' })
      .mockResolvedValueOnce(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)

    const result = await createUser()

    expect(result).toEqual({ id: 'user-1', hash: 'abc12345' })
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2)
  })

  it('propagates errors from prisma.user.create', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockRejectedValue(new Error('DB error'))

    await expect(createUser()).rejects.toThrow('DB error')
  })
})

// ---------------------------------------------------------------------------
// getUserByHash
// ---------------------------------------------------------------------------
describe('getUserByHash', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the user when the hash exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const result = await getUserByHash('abc12345')

    expect(result).toEqual(mockUser)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { hash: 'abc12345' },
    })
  })

  it('returns null when the hash does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getUserByHash('nonexistent')

    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// verifyGroupOwnership
// ---------------------------------------------------------------------------
describe('verifyGroupOwnership', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns true when the user exists and owns the group', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.group.findFirst as jest.Mock).mockResolvedValue(mockGroup)

    const result = await verifyGroupOwnership('abc12345', 'group-1')

    expect(result).toBe(true)
    expect(prisma.group.findFirst).toHaveBeenCalledWith({
      where: { id: 'group-1', userId: 'user-1' },
    })
  })

  it('returns false when the user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await verifyGroupOwnership('invalid', 'group-1')

    expect(result).toBe(false)
    // Should short-circuit without querying groups
    expect(prisma.group.findFirst).not.toHaveBeenCalled()
  })

  it('returns false when the user exists but does not own the group', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.group.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await verifyGroupOwnership('abc12345', 'other-group')

    expect(result).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// createGroup  (from api.ts – hash-based auth for group creation)
// ---------------------------------------------------------------------------
describe('createGroup', () => {
  const validForm = {
    name: 'Test Group',
    information: '',
    currency: '$',
    currencyCode: 'USD' as const,
    participants: [{ name: 'Alice' }, { name: 'Bob' }],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a group when a valid hash is provided', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.group.create as jest.Mock).mockResolvedValue(mockGroup)

    const result = await createGroup(validForm, 'abc12345')

    expect(result).toEqual(mockGroup)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { hash: 'abc12345' },
    })
    expect(prisma.group.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Test Group',
        currency: '$',
        currencyCode: 'USD',
        userId: 'user-1',
        participants: {
          createMany: {
            data: expect.arrayContaining([
              expect.objectContaining({ name: 'Alice' }),
              expect.objectContaining({ name: 'Bob' }),
            ]),
          },
        },
      }),
      include: { participants: true },
    })
  })

  it('throws when no user is found for the given hash', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(createGroup(validForm, 'badhash')).rejects.toThrow(
      'User not found',
    )
  })

  it('throws when every participant name is too short', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const formWithShortNames = {
      ...validForm,
      participants: [{ name: 'A' }, { name: 'B' }],
    }

    await expect(createGroup(formWithShortNames, 'abc12345')).rejects.toThrow(
      'At least one participant with a valid name is required',
    )
  })

  it('filters out participants with short names and creates with valid ones', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.group.create as jest.Mock).mockResolvedValue(mockGroup)

    const mixedForm = {
      ...validForm,
      participants: [
        { name: 'A' }, // too short – filtered out
        { name: 'Alice' }, // valid
        { name: 'Bob' }, // valid
      ],
    }

    await createGroup(mixedForm, 'abc12345')

    // Only participants with name length >= 2 should be included
    const createCall = (prisma.group.create as jest.Mock).mock.calls[0][0]
    const createdData = createCall.data.participants.createMany.data
    expect(createdData).toHaveLength(2)
    expect(createdData.map((p: { name: string }) => p.name)).toEqual([
      'Alice',
      'Bob',
    ])
  })
})
