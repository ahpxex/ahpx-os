import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  blogPostsAtom,
  publishedBlogPostsAtom,
  isAuthenticatedAtom,
} from '@/store/supabaseAtoms'
import { fetchBlogPostsAtom } from '@/store/supabaseActions'

export function useBlogPosts() {
  const posts = useAtomValue(blogPostsAtom)
  const publishedPosts = useAtomValue(publishedBlogPostsAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const fetchPosts = useSetAtom(fetchBlogPostsAtom)

  useEffect(() => {
    fetchPosts(!isAuthenticated)
  }, [fetchPosts, isAuthenticated])

  return {
    posts: isAuthenticated ? posts : publishedPosts,
    loading: false,
    refetch: () => fetchPosts(!isAuthenticated),
  }
}
