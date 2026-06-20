'use client'

import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/trpc/client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [hash, setHash] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()
  const { refetch, isFetching } = trpc.auth.login.useQuery(
    { hash: hash },
    { enabled: false },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (hash.length !== 8) {
      setError('Hash must be exactly 8 characters')
      return
    }

    const result = await refetch()
    if (result.data?.valid) {
      login(hash)
      router.push('/groups')
    } else {
      setError('Invalid hash. Please check and try again.')
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-blue-100/20 dark:border-blue-900/15">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your 8-character access hash to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="login-hash" className="text-sm font-medium mb-1.5 block">Access Hash</label>
              <Input
                id="login-hash"
                placeholder="e.g. aB3xK9mQ"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                maxLength={8}
                className="text-center text-lg font-mono tracking-widest"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-gradient-to-br from-blue-600 to-indigo-600" disabled={isFetching}>
              {isFetching ? 'Checking...' : 'Login'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have a hash?{' '}
              <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
