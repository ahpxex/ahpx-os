import { useAtomValue, useSetAtom } from 'jotai'
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

  // Posts are preloaded via TanStack Router loader, no need to fetch on mount

  return {
    posts: isAuthenticated ? posts : publishedPosts,
    loading: false,
    refetch: () => fetchPosts(!isAuthenticated),
  }
}
