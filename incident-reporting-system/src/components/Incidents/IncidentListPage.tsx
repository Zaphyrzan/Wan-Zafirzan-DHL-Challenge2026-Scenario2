import { useEffect, useMemo, useState } from 'react';
import { getIncidents } from '../../services/incidentService';
import type { Incident } from '../../types';
import './IncidentListPage.css';

type IncidentViewMode = 'all' | 'submitted' | 'draft' | 'resolved';

interface IncidentListPageProps {
  view: IncidentViewMode;
  title: string;
  subtitle: string;
}

export function IncidentListPage({ view, title, subtitle }: IncidentListPageProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getIncidents({ limit: 1000, page: 1, sortBy: 'created_at', sortOrder: 'desc' });
        const incidentsList = Array.isArray(data) ? data : (data as any)?.data || [];
        setIncidents(incidentsList);
      } catch (err: any) {
        console.error('Error fetching incidents:', err);
        setError(err.message || 'Failed to load incidents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncidents();
  }, [view]);

  const filteredIncidents = useMemo(() => {
    if (view === 'all') {
      return incidents;
    }

    if (view === 'submitted') {
      return incidents.filter((incident) => {
        const status = incident.status as string;
        return status === 'submitted' || status === 'reviewed';
      });
    }

    if (view === 'draft') {
      return incidents.filter((incident) => (incident.status as string) === 'draft');
    }

    return incidents.filter((incident) => (incident.status as string) === 'published');
  }, [incidents, view]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="incident-list-page">
      <div className="incident-list-page-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <span className="incident-list-count">{filteredIncidents.length} incidents</span>
      </div>

      {isLoading ? (
        <div className="incident-list-state">Loading incidents...</div>
      ) : error ? (
        <div className="incident-list-state incident-list-error">{error}</div>
      ) : filteredIncidents.length === 0 ? (
        <div className="incident-list-state">No incidents found</div>
      ) : (
        <div className="incident-list-grid">
          {filteredIncidents.map((incident) => (
            <article key={incident.id} className="incident-list-card">
              <div className="incident-list-card-header">
                <h2>{incident.title}</h2>
                <span className={`incident-list-badge incident-list-priority-${incident.priority}`}>
                  {incident.priority.toUpperCase()}
                </span>
              </div>

              <p className="incident-list-description">{incident.description}</p>

              {incident.sender && (
                <p className="incident-list-sender">Sender: {incident.sender}</p>
              )}

              {incident.tags.length > 0 && (
                <div className="incident-list-tags">
                  {incident.tags.map((tag) => (
                    <span key={tag} className="incident-list-tag">{tag}</span>
                  ))}
                </div>
              )}

              <div className="incident-list-footer">
                <span className={`incident-list-status incident-list-status-${incident.status}`}>
                  {incident.status.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span>{formatDate(incident.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default IncidentListPage;