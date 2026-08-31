import { useEffect, useRef } from 'react';
import NotificationService from './notificationService';

/**
 * Custom React Hook for Real-Time Multi-User / Multi-Tab Synchronization
 * Connects to Express SSE stream (/api/events)
 */
export function useLiveSync(onEventCallback) {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Request desktop notification permission on first interaction
    NotificationService.requestPermission();

    const connectSSE = () => {
      try {
        const es = new EventSource('/api/events');
        eventSourceRef.current = es;

        es.onmessage = (e) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload.type === 'connected') return;

            // Trigger desktop notification based on event
            if (payload.type === 'tranche_funded') {
              NotificationService.notifyTrancheFunded({
                applicationId: payload.data.applicationId,
                amount: payload.data.amount
              });
              // Dispatch local window event so any listeners react
              window.dispatchEvent(new CustomEvent('peerpulse-tranche-funded', { detail: payload.data }));
            } else if (payload.type === 'timeline_advanced') {
              NotificationService.notifyTimelineAdvance(payload.data);
              window.dispatchEvent(new CustomEvent('peerpulse-timeline-advanced', { detail: payload.data }));
            } else if (payload.type === 'repayment_received') {
              NotificationService.notifyRepayment({
                loanId: payload.data.loanId,
                amount: payload.data.paidAmount,
                status: payload.data.status
              });
              window.dispatchEvent(new CustomEvent('peerpulse-repayment-updated', { detail: payload.data }));
            } else if (payload.type === 'wallet_updated') {
              window.dispatchEvent(new CustomEvent('peerpulse-wallet-updated', { detail: payload.data }));
            }

            if (onEventCallback) {
              onEventCallback(payload);
            }
          } catch {
            // Ignore parse errors on keepalive
          }
        };

        es.onerror = () => {
          es.close();
          // Retry connection after 5 seconds
          setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.warn('[LiveSync SSE] Offline or error:', err.message);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [onEventCallback]);
}
