import { SubmitExcuseAPI } from "@/components/dailySubmissonStat/api/SubmissionAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSubmitExcuse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      excuse,
      date,
    }: {
      userId: string;
      excuse: string;
      date: string;
    }) => SubmitExcuseAPI(userId, date, excuse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });
};
export default useSubmitExcuse;
