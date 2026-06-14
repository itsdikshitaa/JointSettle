import { ApplePwaSplash } from '@/app/apple-pwa-splash'
import { getBlogIndexWithPosts } from '@/app/blog/[slug]/helpers'
import { FeedbackModal } from '@/components/feedback-button/feedback-button'
import { Nav } from '@/components/nav'
import { ProgressBar } from '@/components/progress-bar'
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { env } from '@/lib/env'
import { TRPCProvider } from '@/trpc/client'
import { HeartFilledIcon } from '@radix-ui/react-icons'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { AxiomWebVitals } from 'next-axiom'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import PlausibleProvider from 'next-plausible'
import Link from 'next/link'
import { Suspense } from 'react'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  title: {
    default: 'JointSettle · Share Expenses with Friends & Family',
    template: '%s · JointSettle',
  },
  description:
    'JointSettle is a minimalist web application to share expenses with friends and family. No ads, no account, no problem.',
  openGraph: {
    title: 'JointSettle · Share Expenses with Friends & Family',
    description:
      'JointSettle is a minimalist web application to share expenses with friends and family. No ads, no account, no problem.',
    images: `/banner.png`,
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@scastiel',
    site: '@scastiel',
    images: `/banner.png`,
    title: 'JointSettle · Share Expenses with Friends & Family',
    description:
      'JointSettle is a minimalist web application to share expenses with friends and family. No ads, no account, no problem.',
  },
  appleWebApp: {
    capable: true,
    title: 'JointSettle',
    statusBarStyle: 'black-translucent',
  },
  applicationName: 'JointSettle',
  icons: [
    {
      url: '/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      url: '/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
}

function Content({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  return (
    <TRPCProvider>
      <Nav />

      <div className="pt-16 flex-1 flex flex-col">{children}</div>

      <footer className="relative overflow-hidden border-t border-border/50 bg-gradient-to-b from-background via-background to-blue-950/5 dark:from-background dark:via-background dark:to-blue-950/20">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 shadow-lg shadow-blue-500/25" />
                <span className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  JointSettle
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t('Footer.madeIn')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.rich('Footer.builtBy', {
                  author: (txt) => (
                    <a href="https://dikshitaa.tech/" target="_blank" rel="noopener" className="text-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-primary/30">
                      {txt}
                    </a>
                  ),
                  source: (txt) => (
                    <a
                      href="https://github.com/itsdikshitaa/JointSettle/graphs/contributors"
                      target="_blank"
                      rel="noopener"
                      className="text-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-primary/30"
                    >
                      {txt}
                    </a>
                  ),
                })}
              </p>
            </div>

            {/* Links Column */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Connect</h3>
              <ul className="flex flex-wrap gap-1.5">
                <li>
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                    <Link target="_blank" href="https://linkedin.com/company/101119877">LinkedIn</Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                    <Link target="_blank" href="https://github.com/itsdikshitaa/JointSettle">GitHub</Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                    <Link target="_blank" href="https://www.reddit.com/r/jointsettle/">Reddit</Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                    <Link target="_blank" href="https://www.indiehackers.com/product/jointsettle">IndieHackers</Link>
                  </Button>
                </li>
              </ul>
              <div className="mt-2">
                <FeedbackModal
                  donationUrl={env.STRIPE_DONATION_LINK}
                  defaultTab="support"
                >
                  <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 -ml-2">
                    <HeartFilledIcon className="w-3.5 h-3.5 mr-1.5" />
                    {t('Support.buttonLabel')}
                  </Button>
                </FeedbackModal>
              </div>
            </div>

            {/* Blog Column */}
            <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">On our blog</h3>
              <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
                <BlogPostsList />
              </Suspense>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline" asChild className="text-xs h-7">
                  <a href="/blog/feed/rss.xml">RSS</a>
                </Button>
                <Button size="sm" variant="outline" asChild className="text-xs h-7">
                  <a href="/blog/feed/feed.xml">Atom</a>
                </Button>
                <Button size="sm" variant="outline" asChild className="text-xs h-7">
                  <a href="/blog/feed/feed.json">JSON</a>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} JointSettle. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Crafted with care
              <span className="inline-block">&#x2728;</span>
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </TRPCProvider>
  )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      {env.PLAUSIBLE_DOMAIN && (
        <PlausibleProvider
          domain={env.PLAUSIBLE_DOMAIN}
          trackOutboundLinks
          manualPageviews
        />
      )}
      <AxiomWebVitals />
      <ApplePwaSplash icon="/logo-with-text.png" color="#2563EB" />
      <body className="min-h-[100dvh] flex flex-col items-stretch bg-background font-sans" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense>
              <ProgressBar />
            </Suspense>
            <Content>{children}</Content>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

async function BlogPostsList() {
  const blogIndex = await getBlogIndexWithPosts()
  return (
    <ul>
      {blogIndex.blogPosts.items.map((post: any) => (
        <li key={post._id}>
          <Button variant="link" asChild size="sm" className="-ml-3 h-7">
            <Link
              href={`/blog/${post._slug}`}
              className="!text-foreground font-normal"
            >
              {post._title}
            </Link>
          </Button>
        </li>
      ))}
      <li>
        <Button variant="link" asChild size="sm" className="-ml-3 h-7">
          <Link href={`/blog`} className="!text-foreground font-normal italic">
            See more…
          </Link>
        </Button>
      </li>
    </ul>
  )
}
