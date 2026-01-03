export type WidgetType = 'text' | 'image' | 'link-button'

export interface WidgetPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface WidgetBase {
  id: string
  type: WidgetType
  position: WidgetPosition
}

export interface TextWidget extends WidgetBase {
  type: 'text'
  content: string // markdown
}

export interface ImageWidget extends WidgetBase {
  type: 'image'
  url: string
  alt?: string
  caption?: string
}

export interface LinkButtonWidget extends WidgetBase {
  type: 'link-button'
  label: string
  url: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline'
}

export type Widget = TextWidget | ImageWidget | LinkButtonWidget

export interface ProfileLayout {
  columns: number
  rowHeight: number
}

export interface ProfileContent {
  widgets: Widget[]
  layout: ProfileLayout
  // Legacy fields for backward compatibility
  about?: string
  skills?: string[]
  contact?: {
    github?: string
    email?: string
    twitter?: string
    linkedin?: string
  }
}

export interface Profile {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  name: string
  slug: string
  icon: string
  date: string | null
  content: ProfileContent
  is_active: boolean
  avatar_url: string | null
}

// Default layout configuration
export const DEFAULT_LAYOUT: ProfileLayout = {
  columns: 12,
  rowHeight: 30,
}

// Default widget sizes by type
export const DEFAULT_WIDGET_SIZES: Record<WidgetType, { width: number; height: number }> = {
  text: { width: 12, height: 4 },
  image: { width: 6, height: 6 },
  'link-button': { width: 4, height: 2 },
}
