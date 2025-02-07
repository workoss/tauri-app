import { create, StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MenuDataItem } from "@ant-design/pro-components";

interface MenuState {
  menus: MenuDataItem[];
  setMenus: (menus: MenuDataItem[]) => void;
}

const menuPersist = (initializer: StateCreator<MenuState>) =>
  persist(initializer, {
    name: "menus",
    storage: createJSONStorage(() => sessionStorage),
  });

export const useMenuStore = create<MenuState>()(
  menuPersist((set) => ({
    menus: [],
    setMenus: (menus: MenuDataItem[]) => set({ menus }),
  }))
);
