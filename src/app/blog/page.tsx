import { formatDate, getBlogIndexWithPosts } from '@/app/blog/[slug]/helpers'
import { TrackPage } from '@/components/track-page'
import { Button } from '@/components/ui/button'
import type { BlogIndexMetadata, BlogPostSummary } from '@/lib/blog-types'
import { basehub } from 'basehub'
import { RichText } from 'basehub/react-rich-text'
import { ChevronRight, Pin } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60
export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { blogIndex } = (await basehub({ next: { revalidate: 60 } }).query({
      blogIndex: { title: true, subtitle: { plainText: true } },
    })) as { blogIndex: BlogIndexMetadata }

    return {
      title: {
        absolute: `${blogIndex.title} · ${blogIndex.subtitle?.plainText}`,
      },
      description: blogIndex.subtitle?.plainText ?? undefined,
      openGraph: {
        title: blogIndex.title ?? '',
        description: blogIndex.subtitle?.plainText ?? undefined,
        images: `/banner.png`,
        type: 'website',
        url: `/blog`,
      },
      twitter: {
        card: 'summary_large_image',
        creator: '@scastiel',
        site: '@scastiel',
        images: `/banner.png`,
        title: blogIndex.title ?? '',
        description: blogIndex.subtitle?.plainText ?? undefined,
      },
    }
  } catch {
    return {
      title: 'Blog',
      description: 'Read our latest blog posts.',
    }
  }
}

export default async function BlogPage() {
  const blogIndex = await getBlogIndexWithPosts()

  return (
    <div>
      <TrackPage path="/blog" />
      <h1 className="text-4xl font-extrabold mt-4 mb-8">{blogIndex.title}</h1>
      <div className="mb-12 prose dark:prose-invert">
        <RichText>{blogIndex.subtitle?.json.content}</RichText>
      </div>
      <ul className="grid gap-4">
        {blogIndex.blogPosts.items.map((post: BlogPostSummary) => (
          <li key={post._id} className="border-t py-6 flex gap-4 items-start">
            <div className="flex-1">
              <div className="text-muted-foreground text-sm mb-2">
                {formatDate(post.date ?? '')}
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5"
                style={{ textWrap: 'balance' }}
              >
                {(post.pinned || post._slug === 'welcome-to-jointsettle') && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm align-middle select-none">
                    <Pin className="w-3 h-3 fill-current rotate-45 shrink-0" />
                    <span>Pinned</span>
                  </span>
                )}
                <Link
                  href={`/blog/${post._slug}`}
                  className="hover:text-primary transition-colors duration-200"
                >
                  {post._title}
                </Link>
              </h2>
              <div className="prose dark:prose-invert">{post.subtitle}</div>
              <div className="mt-1 sm:mt-2">
                <Button asChild variant="link" className="-ml-4">
                  <Link href={`/blog/${post._slug}`}>
                    Read more <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            {post.coverImage && (
              <Image
                src={post.coverImage.url}
                width={post.coverImage.width}
                height={post.coverImage.height}
                alt=""
                className="hidden sm:block flex-0 w-1/3 h-auto aspect-video rounded-lg object-cover shadow mb-8"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
