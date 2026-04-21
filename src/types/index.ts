export type Page = 'login' | 'dashboard'

export interface NavItem {
  icon: string
  label: string
}

export interface PhaseItem {
  icon: string
  label: string
  num: number
}

export interface Milestone {
  id: number
  text: string
}
