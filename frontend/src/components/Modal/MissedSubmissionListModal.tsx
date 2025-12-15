import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";

import {
  MessageSquare,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Copy,
  Check,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/shared/ui/radio-group";
import { Label, Button } from "@/components/shared/ui";
import useModalStore from "@/store/useModalStore";
import { useSubmitExcuse } from "@/hook/useSubmitExcuse";
import { getMissedSubmissions } from "./api/MissedSubmissoinListAPI";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { MissedSubmission } from "./type/type";
import { USER_LIST } from "@/constants/userList";

const EXCUSE_OPTIONS = [
  { label: "벌금 납부 완료", value: "payed" },
  { label: "뭔가 한 거 같아요...", value: "뭔가 한 거 같아요..." },
];

// handle -> name 매핑
const getUserName = (handle: string) => {
  const user = USER_LIST.find((u) => u.handle === handle);
  return user?.name || handle;
};

// 요일 매핑
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const MissedSubmissionListModal = () => {
  // 이번 달 1일 ~ 어제
  const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
  const endDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  const {
    data: missedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["missedSubmissions", startDate, endDate],
    queryFn: () => getMissedSubmissions(startDate, endDate),
  });

  const { mutate: submitExcuse } = useSubmitExcuse();
  const isOpen = useModalStore(
    (state) => state.isMissedSubmissionListModalOpen
  );
  const closeMissedSubmissionListModal = useModalStore(
    (state) => state.closeMissedSubmissionListModal
  );

  // 선택된 미제출 항목
  const [selectedItem, setSelectedItem] = useState<MissedSubmission | null>(
    null
  );
  // 선택된 사유
  const [selectedExcuse, setSelectedExcuse] = useState<string | null>(null);
  // 복사 완료 상태
  const [copied, setCopied] = useState(false);

  const handleSelectItem = (item: MissedSubmission) => {
    setSelectedItem(item);
    setSelectedExcuse(null);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setSelectedExcuse(null);
  };

  const handleExcuseSubmit = () => {
    if (!selectedItem || !selectedExcuse) return;

    submitExcuse(
      {
        userId: selectedItem.userId,
        excuse: selectedExcuse,
        date: selectedItem.date,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedItem(null);
    setSelectedExcuse(null);
    setCopied(false);
  };

  // 클립보드에 복사
  const handleCopy = async () => {
    const text = groupedByDate
      .map(([date, items]) => {
        const d = dayjs(date);
        const weekday = WEEKDAYS[d.day()];
        const names = items.map((item) => getUserName(item.userId)).join(", ");
        return `${d.format(
          "YYYY년 M월 D일"
        )} (${weekday})\n당첨자 ${names} 당첨!!!`;
      })
      .join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.alert("클립보드에 복사되었습니다!\n" + text);
    setTimeout(() => setCopied(false), 2000);
  };

  // 날짜별로 그룹화
  const groupedByDate = useMemo(() => {
    const missedList = missedData?.data?.missedSubmissions || [];
    const grouped: Record<string, MissedSubmission[]> = {};
    for (const item of missedList) {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    }
    // 날짜 내림차순 정렬 (최신순)
    // 날짜 오름차순 정렬 (오래된 순)
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [missedData]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeMissedSubmissionListModal();
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedItem ? (
              <button
                onClick={handleBack}
                className="hover:bg-gray-100 p-1 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
            {selectedItem
              ? `${getUserName(selectedItem.userId)} - ${dayjs(
                  selectedItem.date
                ).format("M월 D일")}`
              : "미제출 목록"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">로딩 중...</span>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>데이터를 불러오지 못했습니다</span>
            </div>
          )}

          {/* 미제출 목록 - 날짜별 그룹화 */}
          {!isLoading && !error && !selectedItem && (
            <div className="space-y-4">
              {groupedByDate.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  🎉 이번 달 미제출 기록이 없습니다!
                </div>
              ) : (
                groupedByDate.map(([date, items]) => (
                  <div key={date} className="space-y-2">
                    {/* 날짜 헤더 */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="font-semibold text-gray-700">
                        {dayjs(date).format("YYYY년 M월 D일 (ddd)")}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({items.length}명)
                      </span>
                    </div>
                    {/* 해당 날짜의 미제출자들 */}
                    <div className="flex flex-wrap gap-2">
                      {items.map((item, idx) => (
                        <button
                          key={`${item.userId}-${idx}`}
                          onClick={() => handleSelectItem(item)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          {getUserName(item.userId)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 사유 선택 */}
          {selectedItem && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">사유를 선택해주세요</p>
              <RadioGroup
                value={selectedExcuse || ""}
                onValueChange={setSelectedExcuse}
                className="space-y-1"
              >
                {EXCUSE_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="border-gray-400"
                    />
                    <Label
                      htmlFor={option.value}
                      className="cursor-pointer text-sm flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          {!selectedItem && (
            <Button onClick={closeMissedSubmissionListModal}>확인</Button>
          )}
          {!selectedItem && groupedByDate.length > 0 && (
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  복사
                </>
              )}
            </Button>
          )}
          {selectedItem && (
            <Button onClick={handleExcuseSubmit} disabled={!selectedExcuse}>
              등록
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MissedSubmissionListModal;
