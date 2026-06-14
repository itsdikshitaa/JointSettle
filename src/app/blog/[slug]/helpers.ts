import { basehub } from 'basehub'

export async function getPostBySlug(slug: string) {
  try {
    const { blogIndex } = await basehub({ next: { revalidate: 60 } }).query({
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
    })

    return blogIndex.blogPosts.items.at(0)
  } catch {
    return undefined
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
    const {
      blogIndex: { blogPosts },
    } = await basehub({ next: { revalidate: 60 } }).query({
      blogIndex: {
        blogPosts: {
          __args: { filter: { isPublished: true } },
          items: { _slug: true, _sys: { lastModifiedAt: true } },
        },
      },
    })
    return blogPosts.items
  } catch {
    return []
  }
}

export async function getBlogIndexWithPosts() {
  try {
    const { blogIndex } = await basehub({ next: { revalidate: 60 } }).query({
      blogIndex: {
        title: true,
        subtitle: { json: { content: true }, plainText: true },
        blogPosts: {
          __args: {
            orderBy: 'date__DESC',
            filter:
              process.env.NODE_ENV === 'production' ? { isPublished: true } : {},
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
    })
    return blogIndex
  } catch {
    return {
      title: '',
      subtitle: { json: { content: [] }, plainText: '' },
      blogPosts: { items: [] },
    }
  }
}
