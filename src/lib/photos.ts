import photosData from '@/data/photos.json'

export interface Photo {
  src: string
  thumb: string
  title: string
  date: string
  place: string
}

export const photos = photosData as Photo[]
