import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';

interface TokenState {
  token: string;
  setToken: (token: string) => void;
}

const tokenPersist = (initializer: StateCreator<TokenState>) =>
  devtools(
    persist(initializer, {
      name: 'token',
      storage: createJSONStorage(() => sessionStorage),
    }),
  );

export const useTokenStore = create<TokenState>()(
  tokenPersist((set) => ({
    token: '',
    setToken: (token: string) => set({ token }),
  })),
);
