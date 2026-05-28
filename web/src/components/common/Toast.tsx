import { useEffect } from 'react';
import {
  Toast as FluentToast,
  ToastTitle,
  ToastBody,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import { useUIStore } from '@/store';

export function Toast() {
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);
  const toast = useUIStore((state) => state.toast);
  const hideToast = useUIStore((state) => state.hideToast);

  useEffect(() => {
    if (toast?.visible) {
      dispatchToast(
        <FluentToast>
          <ToastTitle>{toast.type.toUpperCase()}</ToastTitle>
          <ToastBody>{toast.message}</ToastBody>
        </FluentToast>,
        { intent: toast.type === 'error' ? 'error' : 'success', timeout: 3000 }
      );
      
      // Auto-hide after showing
      setTimeout(() => hideToast(), 3100);
    }
  }, [toast, dispatchToast, hideToast]);

  return <Toaster toasterId={toasterId} position="top-end" />;
}
