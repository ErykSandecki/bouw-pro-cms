import React from 'react'

interface IconProps {
  name: string
  size?: number
  fill?: 0 | 1
  className?: string
  style?: React.CSSProperties
}

const Icon: React.FC<IconProps> = ({ name, size = 24, fill = 0, className = '', style }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontSize: size,
      fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      display: 'inline-block',
      lineHeight: 1,
      userSelect: 'none',
      flexShrink: 0,
      ...style,
    }}
  >
    {name}
  </span>
)

export default Icon
