import { basehub } from 'basehub'
import type { BlogPost, BlogPostSummary, BlogPostSitemap, BlogIndexLanding } from '@/lib/blog-types'
import { MOCK_POSTS } from '@/lib/mock-blog-data'

export async function getPostBySlug(slug: string) {
  try {
    const { blogIndex } = (await basehub({ next: { revalidate: 60 } }).query({
      blogIndex: {
        blogPosts: {
          __args: { first: 1, filter: { _sys_slug: { eq: slug } } },
          items: {
            _id: true,
            _title: true,
            subtitle: true,
            date: true,
            body: { json: { content: true } },
            coverImage: { url: true, width: true, height: true },
            author: {
              name: true,
              avatar: { url: true, width: true, height: true },
            },
          },
        },
      },
    })) as { blogIndex: { blogPosts: { items: BlogPost[] } } }

    return blogIndex.blogPosts.items.at(0) || MOCK_POSTS.find((p) => p._slug === slug)
  } catch {
    return MOCK_POSTS.find((p) => p._slug === slug)
  }
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  })
}

export async function getPosts() {
  try {
    const { blogIndex } = (await basehub({ next: { revalidate: 60 } }).query({
      blogIndex: {
        blogPosts: {
          __args: { filter: { isPublished: true } },
          items: { _slug: true, _sys: { lastModifiedAt: true } },
        },
      },
    })) as { blogIndex: { blogPosts: { items: BlogPostSitemap[] } } }
    
    if (blogIndex.blogPosts.items.length === 0) {
      return MOCK_POSTS.map(p => ({ _slug: p._slug, _sys: { lastModifiedAt: p.date! } }))
    }
    
    return blogIndex.blogPosts.items
  } catch {
    return MOCK_POSTS.map(p => ({ _slug: p._slug, _sys: { lastModifiedAt: p.date! } }))
  }
}

export async function getBlogIndexWithPosts(): Promise<BlogIndexLanding> {
  try {
    const { blogIndex } = (await basehub({ next: { revalidate: 60 } }).query({
      blogIndex: {
        title: true,
        subtitle: { json: { content: true }, plainText: true },
        blogPosts: {
          __args: {
            orderBy: 'date__DESC',
            filter: process.env.NODE_ENV === 'production' ? { isPublished: true } : {},
          },
          items: {
            _id: true,
            _title: true,
            _slug: true,
            subtitle: true,
            date: true,
            coverImage: { url: true, width: true, height: true },
          },
        },
      },
    })) as { blogIndex: BlogIndexLanding }
    
    if (blogIndex.blogPosts.items.length === 0) {
      throw new Error('Fallback to mock')
    }
    
    return blogIndex
  } catch {
    return {
      title: 'JointSettle Blog',
      subtitle: {
        plainText: 'News, tips, and updates from the JointSettle team.',
        json: {
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'News, tips, and updates from the JointSettle team.' }],
            },
          ],
        },
      },
      blogPosts: {
        items: MOCK_POSTS as BlogPostSummary[],
      },
    }
  }
}
