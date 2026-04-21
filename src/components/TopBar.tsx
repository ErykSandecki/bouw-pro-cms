import { useState } from 'react'
import Icon from './Icon'
import { colors as C } from '../theme'

const TopBar: React.FC = () => {
  const [focused, setFocused] = useState(false)

  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        backgroundColor: C.bgDeep,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <Icon
          name="search"
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: C.outline,
            pointerEvents: 'none',
          }}
        />
        <input
          placeholder="Search projects, assets..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: C.surface,
            border: `1px solid ${focused ? C.primaryContainer : C.outlineVar}`,
            borderRadius: 6,
            padding: '8px 12px 8px 36px',
            color: C.onSurface,
            fontSize: 13,
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.2s',
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Icon buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {['notifications', 'settings'].map((icon) => (
          <button
            key={icon}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.onSurfaceVar,
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name={icon} size={22} />
          </button>
        ))}

        {/* Create Project CTA */}
        <button
          style={{
            background: C.primaryContainer,
            color: C.onPrimaryContainer,
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'filter 0.15s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
        >
          <Icon name="add" size={18} />
          Create Project
        </button>
      </div>
    </header>
  )
}

export default TopBar
