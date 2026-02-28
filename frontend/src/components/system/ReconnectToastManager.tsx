import { useEffect, useRef, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { toast } from 'sonner';
import { reconnectState } from '../../utils/reconnectState';
import { Loader2 } from 'lucide-react';

const RECONNECT_TOAST_ID = 'reconnect-toast';

export default function ReconnectToastManager() {
  const { actor, isFetching: actorFetching } = useActor();
  const isFetchingQueries = useIsFetching();
  const isMutating = useIsMutating();
  const [errorState, setErrorState] = useState(false);
  const toastShownRef = useRef(false);

  // Subscribe to reconnect state changes
  useEffect(() => {
    const unsubscribe = reconnectState.subscribe(() => {
      setErrorState(reconnectState.getError());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const hasInFlightOperations = isFetchingQueries > 0 || isMutating > 0;
    const actorUnavailable = !actor || actorFetching;
    const shouldShowToast = (hasInFlightOperations && actorUnavailable) || errorState;

    if (shouldShowToast && !toastShownRef.current) {
      // Show persistent reconnect toast
      toast.loading('Reconnecting…', {
        id: RECONNECT_TOAST_ID,
        duration: Infinity,
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
      });
      toastShownRef.current = true;
    } else if (!shouldShowToast && toastShownRef.current) {
      // Dismiss reconnect toast and show success message
      toast.dismiss(RECONNECT_TOAST_ID);
      toast.success('Connection restored', {
        duration: 2000,
      });
      toastShownRef.current = false;
      
      // Clear error state
      if (errorState) {
        reconnectState.setError(false);
      }
    }
  }, [actor, actorFetching, isFetchingQueries, isMutating, errorState]);

  return null;
}
