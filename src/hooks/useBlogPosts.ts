import { useAtomValue, useSetAtom } from 'jotai'
import { blogPostsAtom } from '@/store/appAtoms'
import { fetchBlogPostsAtom } from '@/store/blogActions'

export function useBlogPosts() {
  const posts = useAtomValue(blogPostsAtom)
  const fetchPosts = useSetAtom(fetchBlogPostsAtom)

  return {
    posts,
    loading: false,
    refetch: () => fetchPosts(false),
  }
}
