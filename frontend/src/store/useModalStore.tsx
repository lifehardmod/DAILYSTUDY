import { create } from "zustand";

interface ModalStore {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}

const useModalStore = create<ModalStore>((set) => ({
  isModalOpen: false,
  setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
}));

export default useModalStore;
