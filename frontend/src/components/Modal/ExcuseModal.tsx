import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui/dialog";
import { MessageSquare } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../../shared/ui/radio-group";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../shared/ui/label";
import { Button } from "../../shared/ui/button";

const EXCUSE_LABELS = [
  "다른 사이트를 이용했어요",
  "코테 혹은 시험이 있었어요",
  "다른 공부를 했어요",
  "납부 완료",
  "기타 사유",
];

interface ExcuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (excuse: { excuse: string }) => void;
}

const ExcuseModal = ({ isOpen, onClose, onSubmit }: ExcuseModalProps) => {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [otherDetail, setOtherDetail] = useState("");
  const [showKakaoCheck, setShowKakaoCheck] = useState(false);
  const [kakaoConfirmed, setKakaoConfirmed] = useState(false);

  const handleExcuseSubmit = () => {
    if (!selectedLabel) return;

    if (!showKakaoCheck) {
      setShowKakaoCheck(true);
      return;
    }

    if (!kakaoConfirmed) {
      alert("카카오톡 방에 인증 사진을 먼저 올려주세요!");
      return;
    }

    let excuseValue = selectedLabel;
    if (selectedLabel === "기타 사유") {
      excuseValue = otherDetail;
    } else if (selectedLabel === "납부 완료") {
      excuseValue = "payed";
    }

    onSubmit({
      excuse: excuseValue,
    });
    onClose();

    // Reset states
    setSelectedLabel(null);
    setOtherDetail("");
    setShowKakaoCheck(false);
    setKakaoConfirmed(false);
  };

  const handleClose = () => {
    onClose();
    // Reset states
    setSelectedLabel(null);
    setOtherDetail("");
    setShowKakaoCheck(false);
    setKakaoConfirmed(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            미제출 사유 등록
          </DialogTitle>
        </DialogHeader>

        {!showKakaoCheck ? (
          <div className="space-y-4">
            <RadioGroup
              value={selectedLabel || ""}
              onValueChange={(value) => setSelectedLabel(value)}
              className="space-y-3 "
            >
              {EXCUSE_LABELS.map((label, idx) => (
                <div
                  key={label}
                  className="flex items-center space-x-3 p-4 border border-gray-400 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem
                    value={label}
                    id={`excuse-${idx}`}
                    className="border-gray-500"
                  />
                  <Label
                    htmlFor={`excuse-${idx}`}
                    className="cursor-pointer text-sm"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {selectedLabel === "기타 사유" && (
              <div className="space-y-2">
                <Label htmlFor="detail" className="text-sm font-medium">
                  상세 사유
                </Label>
                <Textarea
                  id="detail"
                  value={otherDetail}
                  onChange={(e) => setOtherDetail(e.target.value)}
                  placeholder="사유를 입력해주세요"
                  className="resize-none min-h-[80px] "
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col ml-1">
              <p className=" font-semibold">
                카카오톡 방에 인증 사진을 올리셨나요?
              </p>
              <p className=" font-semibold">혹은, 벌금 납부 후 알리셨나요?</p>
            </div>
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <Checkbox
                id="kakao-confirm"
                checked={kakaoConfirmed}
                onCheckedChange={(checked) =>
                  setKakaoConfirmed(checked as boolean)
                }
              />
              <Label htmlFor="kakao-confirm" className="cursor-pointer text-sm">
                네
              </Label>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button
            onClick={handleExcuseSubmit}
            disabled={
              !selectedLabel || (selectedLabel === "기타 사유" && !otherDetail)
            }
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcuseModal;
