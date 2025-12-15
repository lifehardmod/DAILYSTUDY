import { create } from "zustand";

interface ModalStore {
  isExcuseModalOpen: boolean;
  isRulesModalOpen: boolean;
  openExcuseModal: () => void;
  openRulesModal: () => void;
  closeExcuseModal: () => void;
  closeRulesModal: () => void;
  isMissedSubmissionListModalOpen: boolean;
  openMissedSubmissionListModal: () => void;
  closeMissedSubmissionListModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  isExcuseModalOpen: false,
  isRulesModalOpen: false,
  openExcuseModal: () => set({ isExcuseModalOpen: true }),
  openRulesModal: () => set({ isRulesModalOpen: true }),
  closeExcuseModal: () => set({ isExcuseModalOpen: false }),
  closeRulesModal: () => set({ isRulesModalOpen: false }),
  isMissedSubmissionListModalOpen: false,
  openMissedSubmissionListModal: () =>
    set({ isMissedSubmissionListModalOpen: true }),
  closeMissedSubmissionListModal: () =>
    set({ isMissedSubmissionListModalOpen: false }),
}));

export default useModalStore;
