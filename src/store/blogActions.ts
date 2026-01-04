import { atom } from 'jotai'
import { supabase } from '@/lib/supabase/client'
import { blogPostsAtom, userAtom } from './supabaseAtoms'
import type { BlogPost } from '@/types/database'
import type { Json } from '@/lib/supabase/types'

// Create a new blog post
export const createBlogPostAtom = atom(
  null,
  async (
    get,
    set,
    params: {
      title: string
      summary: string
      date: string
      tags: string[]
      content: string
      published?: boolean
    }
  ) => {
    const user = get(userAtom)
    if (!user) throw new Error('Must be authenticated to create blog post')

    // Generate unique slug from title + timestamp suffix
    const baseSlug = params.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const uniqueSuffix = Date.now().toString(36)
    const slug = `${baseSlug}-${uniqueSuffix}`

    const insertData = {
      author_id: user.id,
      title: params.title,
      summary: params.summary,
      date: params.date,
      tags: params.tags,
      content: params.content as unknown as Json,
      slug,
      published: params.published ?? false,
    }

    const { data, error } = await supabase
      .from('blog_posts')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select()
      .single()

    if (error) throw error

    // Update local state
    const currentPosts = get(blogPostsAtom)
    set(blogPostsAtom, [data as BlogPost, ...currentPosts])

    return data
  }
)

// Update a blog post
export const updateBlogPostAtom = atom(
  null,
  async (
    get,
    set,
    params: {
      id: string
      updates: Partial<{
        title: string
        summary: string
        date: string
        tags: string[]
        content: string
        published: boolean
      }>
    }
  ) => {
    const user = get(userAtom)
    if (!user) throw new Error('Must be authenticated to update blog post')

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (params.updates.title !== undefined) {
      updateData.title = params.updates.title
      // Note: Don't update slug to avoid conflicts - slug is immutable after creation
    }
    if (params.updates.summary !== undefined) updateData.summary = params.updates.summary
    if (params.updates.date !== undefined) updateData.date = params.updates.date
    if (params.updates.tags !== undefined) updateData.tags = params.updates.tags
    if (params.updates.content !== undefined) {
      updateData.content = params.updates.content as unknown as Json
    }
    if (params.updates.published !== undefined) updateData.published = params.updates.published

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Update local state
    const currentPosts = get(blogPostsAtom)
    const updatedPosts: BlogPost[] = currentPosts.map((p) =>
      p.id === params.id ? (data as BlogPost) : p
    )
    set(blogPostsAtom, updatedPosts)

    return data
  }
)

// Delete a blog post
export const deleteBlogPostAtom = atom(null, async (get, set, postId: string) => {
  const user = get(userAtom)
  if (!user) throw new Error('Must be authenticated to delete blog post')

  const { error } = await supabase.from('blog_posts').delete().eq('id', postId)

  if (error) throw error

  // Remove from local state
  const currentPosts = get(blogPostsAtom)
  const remainingPosts: BlogPost[] = currentPosts.filter((p) => p.id !== postId)
  set(blogPostsAtom, remainingPosts)
})
