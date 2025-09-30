import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "../../shared/ui/dialog";
import { Info } from "lucide-react";
import { Button } from "../../shared/ui/button";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal = ({ isOpen, onClose }: RulesModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            1일1알고 규칙
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">📚 기본 규칙</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>SQL or 알고리즘 풀기</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>평일 실버 이상 or 프로그래머스 레벨2 이상 풀기</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>
                  그 외(주말, 공휴일 등) 골드 이상 or 프로그래머스 레벨3 이상
                  풀기
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">🎯 면제 조건</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>
                  어학 / 자격증 / 기업 테스트 (인적성제외) / 면접 당일은
                  1일1알고 면제
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>특정 시험 보는 주간에는 해당 시험 공부로 대체 가능</span>
              </li>
              <li className="flex items-start gap-2 ml-4">
                <span className="font-medium">-</span>
                <span className="text-xs">
                  인증필수, 대체인 만큼 열공한 흔적이 있어야합니다
                  <br />
                  (ex. 정처기 모의시험 합격컷 넘기기)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RulesModal;
