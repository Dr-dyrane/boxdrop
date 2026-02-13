import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
    isRightSidebarOpen: boolean;
    toggleRightSidebar: () => void;
    setRightSidebarOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            isRightSidebarOpen: true, // Default open on desktop
            toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
            setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
        }),
        {
            name: 'layout-storage',
            partialize: (state) => ({ isRightSidebarOpen: state.isRightSidebarOpen }),
        }
    )
);
