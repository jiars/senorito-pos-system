import { useFeedback } from "./useFeedback";
import { getPOSInlineFeedback } from "@/utils/pos/feedback/posFeedback";

export const usePOSFeedback = (persistentCode = null) =>
  useFeedback(getPOSInlineFeedback, { persistentCode });
