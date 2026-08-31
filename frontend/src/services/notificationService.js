/**
 * Browser OS Native Notification Service
 * Integrates Web Notification API for instant desktop alerts
 */

class NotificationService {
  static isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  static async requestPermission() {
    if (!this.isSupported()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }

  static notify({ title, body, icon, tag }) {
    if (!this.isSupported() || Notification.permission !== 'granted') return null;

    try {
      return new Notification(title || 'PeerPulse Alert', {
        body,
        icon: icon || '/favicon.ico',
        tag: tag || 'peerpulse-alert',
        badge: '/favicon.ico',
        renotify: true
      });
    } catch {
      return null;
    }
  }

  static notifyTimelineAdvance({ days, simulatedDate, daysOffset }) {
    return this.notify({
      title: `⏳ Portfolio Time Machine: +${days} Days`,
      body: `Simulated date advanced to ${simulatedDate} (Day +${daysOffset}). Daily interest, amortizations, and NACH sweeps computed.`,
      tag: 'time-machine'
    });
  }

  static notifyRepayment({ loanId, amount, status }) {
    return this.notify({
      title: '💳 EMI Repayment Confirmed',
      body: `₹${Number(amount).toLocaleString('en-IN')} collected for Loan ${loanId}. Status: ${status}.`,
      tag: 'repayment'
    });
  }

  static notifyTrancheFunded({ applicationId, amount }) {
    return this.notify({
      title: '🚀 Fractional Tranche Funded',
      body: `₹${Number(amount).toLocaleString('en-IN')} committed to ${applicationId} by syndicate lender.`,
      tag: 'tranche-funded'
    });
  }
}

export default NotificationService;
