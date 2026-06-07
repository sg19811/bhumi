import type { EligibilityAnswers } from "@/app/lib/legal/types";

export type StepProps = {
  answers: Partial<EligibilityAnswers>;
  update: (patch: Partial<EligibilityAnswers>) => void;
};
