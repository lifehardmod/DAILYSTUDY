import { XCircle } from "lucide-react";

const Error = ({ error }: { error: Error }) => {
  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <XCircle className="h-6 w-6 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-800">오류가 발생했습니다</h3>
            <p className="text-gray-600 text-sm mt-1">
              {error?.message || "알 수 없는 오류가 발생했습니다."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Error;
