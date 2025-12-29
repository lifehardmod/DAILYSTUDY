import { create } from "zustand";

interface ModalStore {
  isExcuseModalOpen: boolean;
  isRulesModalOpen: boolean;
  isMissedSubmissionListModalOpen: boolean;
  openExcuseModal: () => void;
  openRulesModal: () => void;
  openMissedSubmissionListModal: () => void;
  closeExcuseModal: () => void;
  closeRulesModal: () => void;
  closeMissedSubmissionListModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  isExcuseModalOpen: false,
  isRulesModalOpen: false,
  isMissedSubmissionListModalOpen: false,

  openExcuseModal: () => set({ isExcuseModalOpen: true }),
  openRulesModal: () => set({ isRulesModalOpen: true }),
  openMissedSubmissionListModal: () =>
    set({ isMissedSubmissionListModalOpen: true }),

  closeExcuseModal: () => set({ isExcuseModalOpen: false }),
  closeRulesModal: () => set({ isRulesModalOpen: false }),
  closeMissedSubmissionListModal: () =>
    set({ isMissedSubmissionListModalOpen: false }),
}));

export default useModalStore;
