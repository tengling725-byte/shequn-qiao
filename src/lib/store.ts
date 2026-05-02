import { create } from 'zustand'

interface User {
  id: string
  nickname?: string
  avatar?: string
  isVerified: boolean
}

interface Community {
  id: string
  name: string
  description?: string
  type: string
  memberCount: number
  isJoined: boolean
}

interface AppState {
  user: User | null
  currentCommunity: Community | null
  communities: Community[]
  setUser: (user: User | null) => void
  setCurrentCommunity: (community: Community | null) => void
  setCommunities: (communities: Community[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentCommunity: null,
  communities: [],
  setUser: (user) => set({ user }),
  setCurrentCommunity: (community) => set({ currentCommunity: community }),
  setCommunities: (communities) => set({ communities })
}))