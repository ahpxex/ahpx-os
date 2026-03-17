import { getBootstrapData } from '@/lib/localData'
import type { AppBootstrapData } from '@/lib/localData'

export type AppLoaderData = AppBootstrapData

export async function loadAppData(): Promise<AppLoaderData> {
  try {
    return await getBootstrapData()
  } catch (error) {
    console.error('Failed to load app data:', error)
    return {
      profiles: [],
      systemInfo: null,
      blogPosts: [],
    }
  }
}
