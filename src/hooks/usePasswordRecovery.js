import { useMutation } from "@tanstack/react-query";

import {
  requestPasswordReset,
  submitPasswordReset,
  submitPasswordSetup,
} from "@/services/auth/passwordRecoveryService";

// Used by the Forgot Password page.
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
};

// Used by the Reset Password page.
export const useResetPassword = () => {
  return useMutation({
    mutationFn: submitPasswordReset,
  });
};

// Used by a new employee creating their first password.
export const useSetupPassword = () => {
  return useMutation({
    mutationFn: submitPasswordSetup,
  });
};
