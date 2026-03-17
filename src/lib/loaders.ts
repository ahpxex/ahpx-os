import { getBootstrapData } from '@/lib/localData'

export async function loadAppData() {
  try {
    return await getBootstrapData()
  } catch (error) {
    console.error('Failed to load app data:', error)
    return {
      profiles: [],
      systemInfo: null,
    }
  }
}
