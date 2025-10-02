import { Button } from "@/components/shared/ui";
import { formatLastCrawlTime } from "../util/util";

interface UpdateButtonProps {
  lastCrawlTime: string | null;
  lastCrawlTimeError: Error | null;
  handleUpdate: () => void;
  isCrawlUpdatePending: boolean;
}

const UpdateButton = ({
  lastCrawlTime,
  lastCrawlTimeError,
  handleUpdate,
  isCrawlUpdatePending,
}: UpdateButtonProps) => {
  return (
    <div className="flex flex-col gap-2 w-fit">
      <Button
        onClick={handleUpdate}
        disabled={isCrawlUpdatePending}
        className=" text-white h-[32px]"
      >
        {isCrawlUpdatePending ? "업데이트 중... 1분소요" : "업데이트"}
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
