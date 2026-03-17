import { atom } from 'jotai'
import { blogPostsAtom } from './appAtoms'
import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
} from '@/lib/localData'
import type { BlogPost } from '@/types/database'

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
    const data = await createBlogPost({
      title: params.title,
      summary: params.summary,
      date: params.date,
      tags: params.tags,
      content: params.content,
      published: params.published ?? false,
    })

    const currentPosts = get(blogPostsAtom)
    set(blogPostsAtom, [data as BlogPost, ...currentPosts])

    return data
  }
)

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
    const data = await updateBlogPost({
      id: params.id,
      updates: params.updates,
    })

    const currentPosts = get(blogPostsAtom)
    const updatedPosts: BlogPost[] = currentPosts.map((post) =>
      post.id === params.id ? (data as BlogPost) : post
    )
    set(blogPostsAtom, updatedPosts)

    return data
  }
)

export const deleteBlogPostAtom = atom(null, async (get, set, postId: string) => {
  await deleteBlogPost(postId)

  const currentPosts = get(blogPostsAtom)
  const remainingPosts: BlogPost[] = currentPosts.filter((post) => post.id !== postId)
  set(blogPostsAtom, remainingPosts)
})
