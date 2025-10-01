import { Info } from "lucide-react";

const RuleButton = ({
  setIsRulesModalOpen,
}: {
  setIsRulesModalOpen: (isRulesModalOpen: boolean) => void;
}) => {
  return (
    <div
      onClick={() => setIsRulesModalOpen(true)}
      className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-sm cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
    >
      <Info className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
      <span className="text-white font-semibold">규칙 확인</span>
    </div>
  );
};

export default RuleButton;
