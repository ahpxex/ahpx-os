import type { ComponentType } from 'react'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface WindowState {
  id: string
  title: string
  icon: string
  component: ComponentType
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  position: Position
  size: Size
}

export type Theme = 'light' | 'dark'

export interface WindowConfig {
  id: string
  title: string
  icon: string
  component: ComponentType
  initialPosition?: Position
  initialSize?: Size
}
