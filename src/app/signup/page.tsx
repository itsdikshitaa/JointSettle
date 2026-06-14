'use client'

import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/trpc/client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Check, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const [generatedHash, setGeneratedHash] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()
  const { mutateAsync, isPending } = trpc.auth.signup.useMutation()

  const handleSignup = async () => {
    const result = await mutateAsync()
    setGeneratedHash(result.hash)
  }

  const handleCopyAndContinue = () => {
    if (!generatedHash) return
    navigator.clipboard.writeText(generatedHash)
    setCopied(true)
    signup(generatedHash)
    setTimeout(() => router.push('/groups'), 1000)
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-blue-100/20 dark:border-blue-900/15">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Access</CardTitle>
          <CardDescription>
            {generatedHash
              ? 'Save this hash — you\'ll need it to access your groups!'
              : 'Generate a unique 8-character access code for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!generatedHash ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Your hash is your identity. Keep it safe — there&apos;s no password reset.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Your Access Hash</p>
                <p className="text-3xl font-mono font-bold tracking-[0.3em] text-blue-700 dark:text-blue-300 select-all">
                  {generatedHash}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                ⚠️ Write this down! If you lose it, your groups are gone forever.
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {!generatedHash ? (
            <Button
              onClick={handleSignup}
              className="w-full bg-gradient-to-br from-blue-600 to-indigo-600"
              disabled={isPending}
            >
              {isPending ? 'Generating...' : 'Generate My Hash'}
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <Button
                onClick={handleCopyAndContinue}
                className="w-full bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
              >
                {copied ? (
                  <><Check className="w-4 h-4 mr-2" /> Saved! Redirecting...</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy & Continue <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have a hash?{' '}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </main>
  )
}
