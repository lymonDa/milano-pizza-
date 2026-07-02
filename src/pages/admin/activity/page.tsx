import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/base/Button';
import { Modal } from '@/components/base/Modal';

interface Activity {
  id: string;
  actor_id: string;
  action: string;
  entity_table: string;
  entity_id: string;
  diff: Record<string, unknown>;
  created_at: string;
}

function ActivityContent() {
  const { t } = useTranslation('common');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (err) throw new Error(err.message);

      const actorIds = [...new Set(((data || []) as Activity[]).map((a) => a.actor_id).filter(Boolean))];
      const emailMap: Record<string, string> = {};

      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', actorIds);
        (profiles || []).forEach((p: Record<string, unknown>) => {
          emailMap[p.id as string] = (p.full_name as string) || (p.id as string);
        });
      }

      setActivities(((data || []) as Activity[]).map((a) => ({
        ...a,
        actor_id: emailMap[a.actor_id] || a.actor_id,
      })));
    } catch (er: unknown) {
      setError(er instanceof Error ? er.message : String(er));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const entityTypes = ['all', ...new Set(activities.map((a) => a.entity_table))];
  const filtered = filterEntity === 'all' ? activities : activities.filter((a) => a.entity_table === filterEntity);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-foreground-600">{error}</p>
        <Button variant="secondary" size="sm" onClick={fetchData}>{t('retry')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">{t('activity')}</h1>
        <p className="text-sm text-foreground-500 mt-0.5">{filtered.length} {t('activityEntryPlural')}</p>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {entityTypes.map((et) => (
          <button
            key={et}
            onClick={() => setFilterEntity(et)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap capitalize',
              filterEntity === et
                ? 'bg-foreground-900 text-background-50'
                : 'bg-background-100 text-foreground-600 hover:text-foreground-800 border border-background-200/70'
            )}
          >
            {et === 'all' ? t('all') : et.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-200/70 bg-background-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('timestamp')}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('actor')}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('action')}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('entity')}</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('details')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-xs text-foreground-600 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-foreground-400">
                      {new Date(a.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-foreground-700 truncate max-w-[160px] block">{a.actor_id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-background-200 text-foreground-700 whitespace-nowrap">
                      {a.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-foreground-600 capitalize">{a.entity_table.replace(/_/g, ' ')}</span>
                    <p className="text-[10px] font-mono text-foreground-400">{a.entity_id}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedActivity(a)}
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-eye-line" />{t('viewDiff')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-foreground-500">{t('noActivityFound')}</p>
          </div>
        )}
      </div>

      <Modal isOpen={selectedActivity !== null} onClose={() => setSelectedActivity(null)} title={t('activityDetails')} className="max-w-md">
        {selectedActivity && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-500">{t('actor')}</span>
                <span className="text-foreground-800 font-medium">{selectedActivity.actor_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-500">{t('action')}</span>
                <span className="text-foreground-800 capitalize">{selectedActivity.action.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-500">{t('entity')}</span>
                <span className="text-foreground-800">
                  {selectedActivity.entity_table.replace(/_/g, ' ')} / {selectedActivity.entity_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-500">{t('timestamp')}</span>
                <span className="text-foreground-800">{new Date(selectedActivity.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="border-t border-background-200/70 pt-4">
              <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider mb-2">{t('changes')}</p>
              <div className="bg-background-50 rounded-lg p-3 border border-background-200/70 font-mono text-xs text-foreground-700 max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{JSON.stringify(selectedActivity.diff, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminActivity() {
  return <AdminAuthGuard><AdminLayout><ActivityContent /></AdminLayout></AdminAuthGuard>;
}