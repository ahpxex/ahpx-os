import { useState, useEffect, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { updateWindowTitleAtom } from '@/store/actions'
import { photoViewerIndexAtom } from '@/store/appAtoms'
import { photos } from '@/lib/photos'

export const PHOTO_VIEWER_ID = 'photo-viewer'

const BLUE = '#3b6ea5'
const GREEN = '#3a9648'

type ViewMode = 'fit' | 'actual'

function ViewerButton({
  label,
  disabled,
  onPress,
  children,
}: {
  label: string
  disabled?: boolean
  onPress?: () => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={label}
      disabled={disabled}
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 26,
        padding: 0,
        border: hovered && !disabled ? '1px solid #ACA899' : '1px solid transparent',
        borderRadius: 3,
        background: hovered && !disabled ? '#FAF9F2' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        boxShadow: 'none',
        outline: 'none',
        minWidth: 0,
        minHeight: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: '#C8C5B8', margin: '0 5px' }} />
}

const PrevIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M11 2 L4 8 L11 14 Z" fill={BLUE} />
  </svg>
)

const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M5 2 L12 8 L5 14 Z" fill={BLUE} />
  </svg>
)

const BestFitIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <rect x="1.5" y="2.5" width="13" height="11" fill="none" stroke={BLUE} strokeDasharray="2 1.5" />
    <circle cx="7" cy="7.5" r="3.2" fill="none" stroke={BLUE} strokeWidth="1.4" />
    <line x1="9.4" y1="9.9" x2="12.6" y2="13.1" stroke={BLUE} strokeWidth="1.6" />
  </svg>
)

const ActualSizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <rect x="1.5" y="2.5" width="13" height="11" fill="none" stroke={BLUE} />
    <text x="8" y="11" textAnchor="middle" fontSize="7" fontFamily="Tahoma, sans-serif" fill={BLUE}>1:1</text>
  </svg>
)

const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="6.5" cy="6.5" r="4.2" fill="none" stroke={BLUE} strokeWidth="1.4" />
    <line x1="9.7" y1="9.7" x2="14" y2="14" stroke={BLUE} strokeWidth="1.8" />
    <line x1="4.5" y1="6.5" x2="8.5" y2="6.5" stroke={BLUE} strokeWidth="1.3" />
    <line x1="6.5" y1="4.5" x2="6.5" y2="8.5" stroke={BLUE} strokeWidth="1.3" />
  </svg>
)

const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="6.5" cy="6.5" r="4.2" fill="none" stroke={BLUE} strokeWidth="1.4" />
    <line x1="9.7" y1="9.7" x2="14" y2="14" stroke={BLUE} strokeWidth="1.8" />
    <line x1="4.5" y1="6.5" x2="8.5" y2="6.5" stroke={BLUE} strokeWidth="1.3" />
  </svg>
)

const RotateCWIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M 12.5 8 A 4.5 4.5 0 1 1 8 3.5" fill="none" stroke={GREEN} strokeWidth="1.6" />
    <path d="M 8 0.5 L 12 3.5 L 8 6.5 Z" fill={GREEN} />
  </svg>
)

const RotateCCWIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M 3.5 8 A 4.5 4.5 0 1 0 8 3.5" fill="none" stroke={GREEN} strokeWidth="1.6" />
    <path d="M 8 0.5 L 4 3.5 L 8 6.5 Z" fill={GREEN} />
  </svg>
)

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <line x1="4" y1="4" x2="12" y2="12" stroke="#C03030" strokeWidth="2" />
    <line x1="12" y1="4" x2="4" y2="12" stroke="#C03030" strokeWidth="2" />
  </svg>
)

const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <rect x="4" y="2" width="8" height="4" fill="#fff" stroke="#666" />
    <rect x="2" y="6" width="12" height="5" fill="#D8D5C8" stroke="#666" />
    <rect x="4" y="9" width="8" height="5" fill="#fff" stroke="#666" />
  </svg>
)

export function PhotoViewerApp() {
  const [index, setIndex] = useAtom(photoViewerIndexAtom)
  const updateTitle = useSetAtom(updateWindowTitleAtom)
  const [mode, setMode] = useState<ViewMode>('fit')
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [naturalWidth, setNaturalWidth] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)

  const photo = photos[index] ?? photos[0]

  useEffect(() => {
    updateTitle({
      windowId: PHOTO_VIEWER_ID,
      title: `${photo.title} - Windows Picture and Fax Viewer`,
    })
  }, [photo, updateTitle])

  const resetView = () => {
    setMode('fit')
    setZoom(1)
    setRotation(0)
  }

  const goTo = (nextIndex: number) => {
    setIndex((nextIndex + photos.length) % photos.length)
    resetView()
  }

  const zoomBy = (factor: number) => {
    if (mode === 'fit' && imgRef.current && naturalWidth > 0) {
      // seed zoom from the currently displayed size so zooming feels continuous
      setZoom((imgRef.current.clientWidth / naturalWidth) * factor)
    } else {
      setZoom((z) => Math.min(8, Math.max(0.05, z * factor)))
    }
    setMode('actual')
  }

  const rotated = rotation % 180 !== 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Image canvas */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          minHeight: 0,
        }}
      >
        <img
          ref={imgRef}
          src={photo.src}
          alt={photo.title}
          onLoad={(e) => setNaturalWidth((e.target as HTMLImageElement).naturalWidth)}
          style={{
            ...(mode === 'fit'
              ? rotated
                ? { maxWidth: '88vh', maxHeight: '88%' }
                : { maxWidth: '96%', maxHeight: '96%' }
              : { width: naturalWidth * zoom || undefined }),
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.15s ease',
            boxShadow: '0 0 0 1px #D5D2C8',
            flexShrink: 0,
          }}
          draggable={false}
        />
      </div>

      {/* Caption strip (not in the original, but the titles deserve it) */}
      <div
        style={{
          textAlign: 'center',
          padding: '3px 8px',
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
          color: '#444',
          borderTop: '1px solid #E5E2D8',
          background: '#FBFAF5',
        }}
      >
        {photo.title}
        <span style={{ color: '#999', marginLeft: 8 }}>
          {photo.date}
          {photo.place ? ` · ${photo.place}` : ''}
          {'　'}({index + 1} / {photos.length})
        </span>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '4px 6px',
          background: '#F1EFE2',
          borderTop: '1px solid #ACA899',
        }}
      >
        <ViewerButton label="Previous Image (Left Arrow)" onPress={() => goTo(index - 1)}>
          <PrevIcon />
        </ViewerButton>
        <ViewerButton label="Next Image (Right Arrow)" onPress={() => goTo(index + 1)}>
          <NextIcon />
        </ViewerButton>
        <Divider />
        <ViewerButton label="Best Fit" onPress={resetView}>
          <BestFitIcon />
        </ViewerButton>
        <ViewerButton
          label="Actual Size"
          onPress={() => {
            setMode('actual')
            setZoom(1)
          }}
        >
          <ActualSizeIcon />
        </ViewerButton>
        <ViewerButton label="Zoom In" onPress={() => zoomBy(1.25)}>
          <ZoomInIcon />
        </ViewerButton>
        <ViewerButton label="Zoom Out" onPress={() => zoomBy(0.8)}>
          <ZoomOutIcon />
        </ViewerButton>
        <Divider />
        <ViewerButton
          label="Rotate Clockwise (Ctrl+K)"
          onPress={() => setRotation((r) => (r + 90) % 360)}
        >
          <RotateCWIcon />
        </ViewerButton>
        <ViewerButton
          label="Rotate Counterclockwise (Ctrl+L)"
          onPress={() => setRotation((r) => (r + 270) % 360)}
        >
          <RotateCCWIcon />
        </ViewerButton>
        <Divider />
        <ViewerButton label="Delete (Del)" disabled>
          <DeleteIcon />
        </ViewerButton>
        <ViewerButton label="Print (Ctrl+P)" disabled>
          <PrintIcon />
        </ViewerButton>
      </div>
    </div>
  )
}
