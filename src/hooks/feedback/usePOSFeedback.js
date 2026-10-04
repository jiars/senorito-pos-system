import { useFeedback } from "./useFeedback";
import { getPOSInlineFeedback } from "@/utils/pos/posFeedback";

export const usePOSFeedback = (persistentCode = null) =>
  useFeedback(getPOSInlineFeedback, { persistentCode });
