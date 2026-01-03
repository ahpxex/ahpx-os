import type { Database } from '@/lib/supabase/types'

export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type SystemInfo = Database['public']['Tables']['system_info']['Row']
export type SystemInfoInsert = Database['public']['Tables']['system_info']['Insert']
export type SystemInfoUpdate = Database['public']['Tables']['system_info']['Update']
