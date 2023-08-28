import {create} from 'zustand'
import {UserInfo} from "social-contract";

interface ProfileState {
    profile: UserInfo | null
    isInitProfile: boolean,
    isLoadingProfile: boolean,
    setProfile: (p: any) => void
    setIsLoadingProfile: (p: boolean) => void
}

export const useProfileStore = create<ProfileState>()((set) => ({
    profile: null,
    isInitProfile: false,
    isLoadingProfile: false,
    setProfile: (p) => set(() => ({
        profile: p,
        isInitProfile: true
    })),
    setIsLoadingProfile: (status) => set(() => ({
        isLoadingProfile: status
    })),
}))