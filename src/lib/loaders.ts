import { getBootstrapData } from '@/lib/localData'

export function loadAppData() {
  try {
    return getBootstrapData()
  } catch (error) {
    console.error('Failed to load app data:', error)
    return {
      profiles: [],
      systemInfo: null,
    }
  }
}
