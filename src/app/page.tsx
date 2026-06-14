import { Contributors } from '@/app/contributors'
import { StatsDisplay } from '@/app/stats-display'
import { FeedbackModal } from '@/components/feedback-button/feedback-button'
import { TrackPage } from '@/components/track-page'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'
import {
  BarChartHorizontalBig,
  Calendar,
  CircleDollarSign,
  Divide,
  FileImage,
  FolderTree,
  Github,
  LucideIcon,
  ShieldX,
  Users,
  Wand2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ReactNode, Suspense } from 'react'

export default function HomePage() {
  const t = useTranslations()
  return (
    <main>
      <TrackPage path="/" />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
        {/* Animated glowing orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-400/5 animate-float-slow" />
          <div className="absolute top-60 -right-32 w-[30rem] h-[30rem] rounded-full bg-indigo-500/10 dark:bg-indigo-400/5 animate-float" style={{ animationDelay: '-1.5s' }} />
          <div className="absolute bottom-20 left-1/4 w-64 h-64 rounded-full bg-blue-600/5 dark:bg-blue-300/5 animate-float-slow" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/3 left-3/4 w-48 h-48 rounded-full bg-indigo-400/5 dark:bg-indigo-500/5 animate-float" style={{ animationDelay: '-2.5s' }} />
          <div className="absolute -bottom-16 left-1/2 w-80 h-80 rounded-full bg-blue-400/5 dark:bg-blue-600/5 animate-float-slow" style={{ animationDelay: '-4s' }} />
        </div>

        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-transparent dark:from-blue-950/10 dark:via-transparent dark:to-transparent pointer-events-none" aria-hidden="true" />

        <div className="relative mx-auto max-w-screen-md px-4 flex flex-col items-center gap-5 text-center">
          <div className="animate-fade-in-down">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-medium bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm animate-pulse-soft">
              No ads. Simple hash-based auth. Open Source. Forever Free.
            </Badge>
          </div>

          <h1 className="!leading-none font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl py-3 text-balance animate-fade-in-up tracking-tight">
            {t.rich('Homepage.title', {
              strong: (chunks) => <strong className="animated-gradient-text">{chunks}</strong>,
            })}
          </h1>

          <p className="max-w-[36rem] leading-relaxed text-muted-foreground text-lg sm:text-xl sm:leading-8 animate-fade-in-up animation-delay-200">
            Split expenses effortlessly with friends and family. Sign up with a simple access hash — no email needed.
          </p>

          <div className="flex gap-3 animate-fade-in-up animation-delay-300">
            <Button asChild size="lg" className="relative overflow-hidden group bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-600/20 transition-all duration-300 hover:shadow-blue-500/40 dark:hover:shadow-blue-600/30">
              <Link href="/groups/create">
                <span className="relative z-10 font-medium">Create a group</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="group border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-300/50 dark:hover:border-blue-700/50 transition-all duration-300">
              <Link href="/blog">
                Read our blog
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </Link>
            </Button>
          </div>

          <StatsDisplay />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50/20 to-white dark:from-blue-950/10 dark:to-background">
        <div className="absolute inset-0 dot-pattern pointer-events-none" aria-hidden="true" />
        <div className="relative mx-auto max-w-screen-md px-4 flex flex-col items-center text-center">
          <h2 className="font-heading font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl animate-fade-in-up tracking-tight">
            Features
          </h2>
          <p className="mt-3 md:mt-4 leading-relaxed text-muted-foreground text-lg sm:text-xl max-w-xl animate-fade-in-up animation-delay-100 text-balance">
            Everything you need to track and share expenses with your friends and family.
          </p>
          <div className="mt-10 md:mt-12 w-full grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
            <Feature
              Icon={Calendar}
              name="Recurring Expenses"
              description="Create daily, weekly, and monthly recurring expenses."
              beta
              index={0}
            />
            <Feature
              Icon={Users}
              name="Groups"
              description="Create a group for a travel, an event, a gift… and add expenses to it."
              index={1}
            />
            <Feature
              Icon={FolderTree}
              name="Categories"
              description="Assign categories to your expenses."
              index={2}
            />
            <Feature
              Icon={FileImage}
              name="Receipts"
              description="Attach receipt images to expenses."
              index={3}
            />
            <Feature
              Icon={Wand2}
              name="AI Scan"
              description="Scan receipts to create expenses faster."
              beta
              index={4}
            />
            <Feature
              Icon={Divide}
              name="Advanced split"
              description="Split expenses by percentage, shares or amount."
              index={5}
            />
            <Feature
              Icon={BarChartHorizontalBig}
              name="Balances"
              description="Visualize how much each participant spent."
              index={6}
            />
            <Feature
              Icon={CircleDollarSign}
              name="Reimbursements"
              description="Optimize money transfers between participants."
              index={7}
            />
            <Feature
              Icon={ShieldX}
              name="No ads"
              description="No account. No limitation. No problem."
              index={8}
            />
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 dark:bg-blue-400/5 animate-float-slow" style={{ animationDelay: '-2s' }} />
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 animate-float" style={{ animationDelay: '-4s' }} />
        </div>
        <div className="relative mx-auto max-w-screen-md px-4 flex flex-col items-center text-center">
          <div className="w-full rounded-2xl border border-blue-100/30 dark:border-blue-900/20 bg-white/40 dark:bg-white/5 backdrop-blur-sm p-8 md:p-12 shadow-sm">
            <h2 className="font-heading font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl animate-fade-in-up tracking-tight">
              Proudly Open Source
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground text-lg animate-fade-in-up animation-delay-100 max-w-xl mx-auto text-balance">
              JointSettle is open source and lives thanks to amazing{' '}
              <a
                className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/30 hover:decoration-blue-500 transition-all duration-300 font-medium"
                target="_blank"
                href="https://github.com/itsdikshitaa/JointSettle/graphs/contributors"
              >
                contributors
              </a>
              !
            </p>
            <div className="mt-8 animate-fade-in-up animation-delay-200">
              <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
                <Contributors />
              </Suspense>
            </div>
            <div className="mt-6 animate-fade-in-up animation-delay-300">
              <Button asChild variant="outline" size="lg" className="group border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-300/50 dark:hover:border-blue-700/50 transition-all duration-300">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/itsdikshitaa/JointSettle"
                >
                  <Github className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50/20 to-white dark:from-blue-950/10 dark:to-background">
        <div className="absolute inset-0 dot-pattern pointer-events-none" aria-hidden="true" />
        <div className="relative mx-auto max-w-screen-md px-4 flex flex-col items-center text-center">
          <h2 className="font-heading font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl animate-fade-in-up tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="text-left w-full max-w-screen-md mx-auto mt-10 animate-fade-in-up animation-delay-100">
            <Accordion type="multiple" className="space-y-2">
              <Answer
                id="free-to-use"
                question={
                  <>
                    Is <strong>JointSettle</strong> free to use?
                  </>
                }
              >
                Yes, you can use JointSettle for free, without any limitation! Note
                that in the future, we might add premium features, but we&rsquo;ll
                never put essential features behind a paywall.
              </Answer>
              <Answer
                id="differences"
                question={
                  <>
                    What differentiates <strong>JointSettle</strong> from other
                    similar services?
                  </>
                }
              >
                JointSettle is more minimalist than Splitwise or Tricount, and uses
                a simple hash-based authentication — no email or personal info needed.
                It offers similar features, but we&rsquo;re still working on some
                of them. Have a look at{' '}
                <a
                  target="_blank"
                  className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/30"
                  href="https://github.com/itsdikshitaa/JointSettle/issues"
                >
                  issues on GitHub
                </a>{' '}
                to have an idea of what our contributors are working on!
              </Answer>
              <Answer id="data" question={<>How is my data stored?</>}>
                All the data you enter on JointSettle (groups, expenses&hellip;) is stored
                in a PostgreSQL database hosted by{' '}
                <a target="_blank" className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/30" href="https://vercel.com">
                  Vercel
                </a>{' '}
                (same as the web application itself). For now, the data is not
                encrypted, but we&rsquo;re trying to find the best way to add
                encryption without impacting the user experience too much (see{' '}
                <a
                  target="_blank"
                  className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/30"
                  href="https://github.com/itsdikshitaa/JointSettle/issues/34"
                >
                  this issue on GitHub
                </a>
                ).
              </Answer>
              <Answer
                id="feedback"
                question={
                  <>
                    What is the best way to give feedback or suggest a feature?
                  </>
                }
              >
                You can give us feedback by using{' '}
                <FeedbackModal donationUrl={env.STRIPE_DONATION_LINK}>
                  <Button variant="link" className="text-base -mx-4 -my-4 text-blue-600 dark:text-blue-400">
                    our feedback form
                  </Button>
                </FeedbackModal>
                . We&rsquo;ll receive it by email and will keep you update, if you
                want to provide your email. But even better, if you know GitHub
                and have an account, you can report issues or suggest a feature
                by{' '}
                <a
                  target="_blank"
                  className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/30"
                  href="https://github.com/itsdikshitaa/JointSettle/issues"
                >
                  creating an issue
                </a>{' '}
                there. This way, all our contributors will see it and will be
                able to give their insight.
              </Answer>
              <Answer
                id="contribute"
                question={<>I use JointSettle and like it. How can I contribute?</>}
              >
                <p>You can contribute to JointSettle by several ways.</p>
                <ul>
                  <li>
                    You can share it with your community on social media to let
                    them know about us,
                  </li>
                  <li>
                    You can{' '}
                    <FeedbackModal
                      donationUrl={env.STRIPE_DONATION_LINK}
                      defaultTab="support"
                    >
                      <Button
                        variant="link"
                        className="text-base text-emerald-600 dark:text-emerald-400 -mx-4 -my-4"
                      >
                        support our hosting costs
                      </Button>
                    </FeedbackModal>{' '}
                    by sponsoring us or donating a small amount,
                  </li>
                  <li>
                    If you&rsquo;re a developer, you can implement new features or
                    improve the user experience! Go to{' '}
                    <a
                      target="_blank"
                      className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/30"
                      href="https://github.com/itsdikshitaa/JointSettle"
                    >
                      our GitHub repository
                    </a>{' '}
                    to know more about the project.
                  </li>
                </ul>
              </Answer>
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({
  name,
  Icon,
  description,
  beta = false,
  index = 0,
}: {
  name: ReactNode
  Icon: LucideIcon
  description: ReactNode
  beta?: boolean
  index?: number
}) {
  const delayClass = [
    'animation-delay-100',
    'animation-delay-200',
    'animation-delay-300',
    'animation-delay-400',
    'animation-delay-500',
    'animation-delay-600',
    'animation-delay-700',
    'animation-delay-800',
    'animation-delay-900',
  ][index] || 'animation-delay-100'

  return (
    <div
      className={`relative rounded-xl border border-blue-100/30 dark:border-blue-900/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 flex flex-col gap-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-600/10 hover:border-blue-300/40 dark:hover:border-blue-700/40 group animate-fade-in-up ${delayClass}`}
    >
      {beta && (
        <Badge className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[10px] px-2 py-0.5 animate-pulse-soft">
          Beta
        </Badge>
      )}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-blue-500/20">
        <Icon className="w-5 h-5 text-blue-700 dark:text-blue-400 transition-all duration-300" />
      </div>
      <div>
        <strong className="text-foreground transition-colors duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 font-semibold">{name}</strong>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed text-balance">
        {description}
      </div>
    </div>
  )
}

function Answer({
  id,
  question,
  children,
}: {
  id: string
  question: ReactNode
  children: ReactNode
}) {
  return (
    <AccordionItem value={id} className="rounded-lg border border-blue-100/30 dark:border-blue-900/20 bg-white/40 dark:bg-white/5 backdrop-blur-sm px-4 data-[state=open]:pb-2 transition-colors duration-300">
      <AccordionTrigger className="text-left text-base sm:text-lg hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200 font-medium py-4 [&[data-state=open]>svg]:text-emerald-500 [&>svg]:text-blue-500/50 dark:[&>svg]:text-blue-400/50">
        <span>{question}</span>
      </AccordionTrigger>
      <AccordionContent className="prose dark:prose-invert prose-sm sm:prose-base text-muted-foreground">
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}
