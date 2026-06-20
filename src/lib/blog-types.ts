/**
 * Type definitions for the basehub blog content model.
 *
 * These replace `as any` casts throughout the blog codebase by
 * providing typed interfaces for each basehub query response shape.
 */

// ── Author ────────────────────────────────────────────────────────────────

export interface BlogAuthor {
  name: string | null
  avatar: { url: string; width: number; height: number } | null
}

// ── Image ─────────────────────────────────────────────────────────────────

export interface BlogImage {
  url: string
  width: number
  height: number
}

// ── Blog Post (full) ───────────────────────────────────────────────────────

export interface BlogPost {
  _id: string
  _title: string
  _slug: string
  pinned?: boolean
  subtitle: string | null
  date: string | null
  body?: { json: { content: unknown[] } } | null
  coverImage: BlogImage | null
  author: BlogAuthor | null
}

// ── Blog Post (list / summary) ─────────────────────────────────────────────

export interface BlogPostSummary {
  _id: string
  _title: string
  _slug: string
  pinned?: boolean
  subtitle: string | null
  date: string | null
  coverImage: BlogImage | null
}

// ── Blog Post (sitemap) ────────────────────────────────────────────────────

export interface BlogPostSitemap {
  _slug: string
  _sys: { lastModifiedAt: string }
}

// ── Blog Index (landing page) ──────────────────────────────────────────────

export interface BlogIndexLanding {
  title: string
  subtitle: { json: { content: unknown[] }; plainText: string }
  blogPosts: { items: BlogPostSummary[] }
}

// ── Blog Index (metadata) ──────────────────────────────────────────────────

export interface BlogIndexMetadata {
  title: string | null
  subtitle: { plainText: string | null } | null
}
