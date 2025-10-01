import { create } from "zustand";

interface ModalStore {
  isExcuseModalOpen: boolean;
  isRulesModalOpen: boolean;
  openExcuseModal: () => void;
  openRulesModal: () => void;
  closeExcuseModal: () => void;
  closeRulesModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  isExcuseModalOpen: false,
  isRulesModalOpen: false,
  openExcuseModal: () => set({ isExcuseModalOpen: true }),
  openRulesModal: () => set({ isRulesModalOpen: true }),
  closeExcuseModal: () => set({ isExcuseModalOpen: false }),
  closeRulesModal: () => set({ isRulesModalOpen: false }),
}));

export default useModalStore;
