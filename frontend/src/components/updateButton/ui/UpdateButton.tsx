import { Button } from "@/components/shared";
import { formatLastCrawlTime } from "../util/util";

interface UpdateButtonProps {
  lastCrawlTime: string | null;
  lastCrawlTimeLoading: boolean;
  lastCrawlTimeError: Error | null;
  handleUpdate: () => void;
}

const UpdateButton = ({
  lastCrawlTime,
  lastCrawlTimeLoading,
  lastCrawlTimeError,
  handleUpdate,
}: UpdateButtonProps) => {
  return (
    <div className="flex flex-col gap-2 w-fit">
      <Button
        onClick={handleUpdate}
        disabled={lastCrawlTimeLoading}
        className=" text-white h-[32px]"
      >
        {lastCrawlTimeLoading ? "업데이트 중... 1분소요" : "업데이트"}
      </Button>
      <div className="text-xs text-gray-500 text-center">
        {lastCrawlTimeError
          ? lastCrawlTimeError.message
          : formatLastCrawlTime(lastCrawlTime)}
      </div>
    </div>
  );
};

export default UpdateButton;
