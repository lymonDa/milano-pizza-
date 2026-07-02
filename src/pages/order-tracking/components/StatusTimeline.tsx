import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface StatusStep {
  status: string;
  changed_at: string;
}

const orderFlow = ['pending_payment', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const statusIcons: Record<string, string> = {
  pending_payment: 'ri-time-line',
  confirmed: 'ri-check-double-line',
  preparing: 'ri-fire-line',
  out_for_delivery: 'ri-motorbike-line',
  delivered: 'ri-checkbox-circle-line',
  cancelled: 'ri-close-circle-line',
};

interface StatusTimelineProps {
  history: StatusStep[];
  currentStatus: string;
}

export function StatusTimeline({ history, currentStatus }: StatusTimelineProps) {
  const { t } = useTranslation('common');

  const historyMap: Record<string, string> = {};
  history.forEach((h) => {
    historyMap[h.status] = h.changed_at;
  });

  const isCancelled = currentStatus === 'cancelled';
  const activeIndex = isCancelled ? orderFlow.length : orderFlow.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {orderFlow.map((status, i) => {
        const icon = statusIcons[status];
        const ts = historyMap[status];
        const isActive = i <= activeIndex;
        const isCurrent = status === currentStatus;
        const isLast = i === orderFlow.length - 1;

        return (
          <div key={status} className="flex items-start gap-3">
            {/* Connector + Dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                  isActive
                    ? isCurrent && isCancelled
                      ? 'bg-accent-100 text-accent-600'
                      : isCurrent
                        ? 'bg-primary-500 text-background-50'
                        : 'bg-primary-100 text-primary-600'
                    : 'bg-background-200 text-foreground-400'
                )}
              >
                <i className={cn(icon, 'text-sm')} />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 h-8 transition-colors',
                    i < activeIndex ? 'bg-primary-300' : 'bg-background-200'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive ? 'text-foreground-900' : 'text-foreground-400'
                )}
              >
                {t(status)}
              </p>
              {ts && (
                <p className="text-xs text-foreground-500 mt-0.5">
                  {new Date(ts).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' · '}
                  {new Date(ts).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
              {!ts && isActive && !isCancelled && (
                <p className="text-xs text-foreground-400 italic mt-0.5">{t('pendingTimelineStatus')}</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Cancelled override */}
      {isCancelled && historyMap.cancelled && (
        <div className="flex items-start gap-3 mt-1">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-accent-100 text-accent-600">
              <i className="ri-close-circle-line text-sm" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-accent-700">{t('cancelledStatus')}</p>
            <p className="text-xs text-foreground-500 mt-0.5">
              {new Date(historyMap.cancelled).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' · '}
              {new Date(historyMap.cancelled).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}