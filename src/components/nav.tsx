'use client'

import { Logo } from '@/components/logo'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { NewsButton } from '@/components/news-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function Nav() {
  const t = useTranslations()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-out ${
        scrolled
          ? 'bg-background/70 dark:bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-transparent border-transparent'
      }`}
    >
      <Logo />

      <nav role="navigation" aria-label="Menu" className="flex items-center">
        <ul className="flex items-center gap-1">
          <li>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={`-my-3 transition-all duration-300 ${
                scrolled
                  ? 'text-foreground/80 hover:text-foreground'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              <Link href="/groups">{t('Header.groups')}</Link>
            </Button>
          </li>
          <li>
            <NewsButton />
          </li>
          <li>
            <LocaleSwitcher />
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
