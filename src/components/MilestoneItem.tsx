import { useState } from 'react'
import Icon from './Icon'
import { colors as C } from '../theme'

interface MilestoneItemProps {
  text: string
  onDelete: () => void
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ text, onDelete }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: C.surfaceLow,
        padding: '10px 12px',
        borderRadius: 6,
        border: `1px solid ${C.outlineVar}`,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          border: `2px solid ${C.tertiary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="check" size={14} fill={1} style={{ color: C.tertiary }} />
      </div>
      <span style={{ flex: 1, color: C.onSurface, fontSize: 13 }}>{text}</span>
      <button
        onClick={onDelete}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: C.error,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Icon name="delete" size={18} />
      </button>
    </div>
  )
}

export default MilestoneItem
