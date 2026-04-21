import { useState } from 'react'
import Icon from './Icon'
import { colors as C } from '../theme'
import type { NavItem } from '../types'

const NAV_ITEMS: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard' },
  { icon: 'account_tree', label: 'Projects' },
  { icon: 'group', label: 'Team' },
  { icon: 'folder_open', label: 'Assets' },
  { icon: 'bar_chart', label: 'Reports' },
]

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'help', label: 'Help' },
  { icon: 'logout', label: 'Logout' },
]

const Sidebar: React.FC = () => {
  const [active, setActive] = useState('Projects')

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        backgroundColor: C.bgBrand,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
        height: '100vh',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <div
          style={{
            color: C.primaryContainer,
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          BouwPro
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              backgroundColor: '#6a3932',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="account_tree" size={18} style={{ color: C.primaryContainer }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Global Admin</div>
            <div
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 9,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Management Suite
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ icon, label }) => {
          const isActive = active === label
          return (
            <button
              key={label}
              onClick={() => setActive(label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 4,
                border: 'none',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft: isActive ? `3px solid ${C.gold}` : '3px solid transparent',
                color: isActive ? C.gold : 'rgba(255,255,255,0.55)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.01em',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                width: '100%',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon name={icon} size={20} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Bottom nav */}
      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {BOTTOM_ITEMS.map(({ icon, label }) => (
          <button
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,0.45)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name={icon} size={18} />
            {label}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
