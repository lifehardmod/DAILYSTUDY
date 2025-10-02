import { CheckCircle, XCircle, Users } from "lucide-react";
interface SubmitStatusCardProps {
  value: number;
  variant: "제출 완료" | "미제출" | "전체";
}

const SubmitStatusCard = ({ value, variant }: SubmitStatusCardProps) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-center gap-2">
        {variant === "제출 완료" && (
          <CheckCircle className="h-5 w-5 text-gray-600" />
        )}
        {variant === "미제출" && <XCircle className="h-5 w-5 text-gray-600" />}
        {variant === "전체" && <Users className="h-5 w-5 text-gray-600" />}

        <span className="text-gray-800 font-medium">{variant}</span>
      </div>
      <p className="text-2xl font-bold text-gray-700 text-center mt-2">
        {value}명
      </p>
    </div>
  );
};

export default SubmitStatusCard;
