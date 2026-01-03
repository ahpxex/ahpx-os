import { supabase } from '@/lib/supabase/client'
import type { Profile, SystemInfo } from '@/types/database'
import type { User, Session } from '@supabase/supabase-js'

export interface AppLoaderData {
  profiles: Profile[]
  systemInfo: SystemInfo | null
  user: User | null
  session: Session | null
}

export async function loadAppData(): Promise<AppLoaderData> {
  // Fetch all data in parallel
  const [profilesResult, systemInfoResult, sessionResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('system_info')
      .select('*')
      .eq('is_active', true)
      .single(),
    supabase.auth.getSession(),
  ])

  const session = sessionResult.data.session

  return {
    profiles: (profilesResult.data as Profile[]) || [],
    systemInfo: systemInfoResult.data as SystemInfo | null,
    user: session?.user || null,
    session: session || null,
  }
}
