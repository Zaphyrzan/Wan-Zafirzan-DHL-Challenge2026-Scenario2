/**
 * Admin Dashboard Component
 * Displays critical incidents and system overview
 */

import { useState, useEffect } from 'react';
import { getIncidents } from '../../services/incidentService';
import '../Dashboard/IncidentViewer.css';
import './AdminDashboard.css';

/**
 * Incident item interface
 */
interface IncidentItem {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Admin Dashboard Component
 */
export function AdminDashboard() {
  // State
  const [criticalIncidents, setCriticalIncidents] = useState<IncidentItem[]>([]);
  const [allIncidents, setAllIncidents] = useState<IncidentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  // Fetch incidents on mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  /**
   * Fetch all incidents
   */
  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch incidents from service
      const data = await getIncidents();

      // Extract incidents from response (handle paginated response)
      const incidentsList = Array.isArray(data) ? data : (data as any)?.data || [];

      // Set all incidents
      setAllIncidents(incidentsList);

      // Filter critical and high priority incidents (for dashboard)
      const critical = incidentsList.filter(
        (inc) => inc.priority === 'critical' || inc.priority === 'high'
      );

      // Sort by priority (critical first) then by created_at (newest first)
      critical.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff =
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder];

        if (priorityDiff !== 0) return priorityDiff;

        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setCriticalIncidents(critical);
    } catch (err: any) {
      console.error('Error fetching incidents:', err);
      setError('Failed to load incidents');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get filtered incidents based on priority
   */
  const getFilteredIncidents = (): IncidentItem[] => {
    if (priorityFilter === 'all') return allIncidents;

    return allIncidents.filter((inc) => inc.priority === priorityFilter);
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return '#991B1B';
      case 'high':
        return '#92400e';
      case 'medium':
        return '#1e40af';
      case 'low':
        return '#166534';
      default:
        return '#666';
    }
  };

  /**
   * Format date
   */
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

  // JSX render
  return (
    <div className="admin-dashboard">
      {/* Welcome section */}
      <div className="dashboard-welcome">
        <h1>Welcome, Admin</h1>
        <p>Here's an overview of critical incidents requiring attention</p>
      </div>

      {/* Critical incidents section */}
      <div className="critical-section">
        <div className="section-header">
          <h2>🔴 Critical & High Priority Incidents</h2>
          <span className="incident-count">{criticalIncidents.length} incidents</span>
        </div>

        {isLoading ? (
          <div className="incident-viewer-loading">
            <div className="spinner"></div>
            <p>Loading incidents...</p>
          </div>
        ) : error ? (
          <div className="incident-viewer-error">
            <p>{error}</p>
          </div>
        ) : criticalIncidents.length === 0 ? (
          <div className="incident-viewer-empty">
            <p>✅ No critical incidents</p>
            <p className="empty-subtitle">All incidents are under control</p>
          </div>
        ) : (
          <div className="critical-incidents-list">
            {criticalIncidents.map((incident) => (
              <div
                key={incident.id}
                className="critical-incident-card"
                onClick={() => setSelectedIncident(incident)}
              >
                {/* Priority indicator */}
                <div
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(incident.priority) }}
                ></div>

                {/* Content */}
                <div className="critical-card-content">
                  <div className="critical-card-header">
                    <h3>{incident.title}</h3>
                    <span
                      className={`priority-badge priority-${incident.priority}`}
                    >
                      {incident.priority.toUpperCase()}
                    </span>
                  </div>

                  <p className="critical-card-description">{incident.description}</p>

                  <div className="critical-card-footer">
                    <span className="created-date">
                      {formatDate(incident.created_at)}
                    </span>
                    <span className={`status-badge status-${incident.status}`}>
                      {incident.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All incidents section with filters */}
      <div className="all-incidents-section">
        <div className="section-header">
          <h2>📋 All Incidents</h2>
          <span className="incident-count">{getFilteredIncidents().length} incidents</span>
        </div>

        {/* Priority filter */}
        <div className="filter-container">
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Incidents list */}
        <div className="incidents-list">
          {getFilteredIncidents().length === 0 ? (
            <div className="incident-viewer-empty">
              <p>No incidents found</p>
            </div>
          ) : (
            getFilteredIncidents().map((incident) => (
              <div
                key={incident.id}
                className="incident-card"
                onClick={() => setSelectedIncident(incident)}
              >
                {/* Card header */}
                <div className="incident-card-header">
                  <h3 className="incident-card-title">{incident.title}</h3>
                  <div className="incident-card-badges">
                    <span
                      className={`priority-badge priority-${incident.priority}`}
                    >
                      {incident.priority.toUpperCase()}
                    </span>
                    <span className={`status-badge status-${incident.status}`}>
                      {incident.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="incident-card-description">{incident.description}</p>

                {/* Tags */}
                {incident.tags.length > 0 && (
                  <div className="incident-tags">
                    {incident.tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="incident-card-footer">
                  {formatDate(incident.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedIncident && (
        <div className="incident-detail-modal" onClick={() => setSelectedIncident(null)}>
          <div
            className="incident-detail-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="modal-close-btn"
              onClick={() => setSelectedIncident(null)}
            >
              ×
            </button>

            {/* Modal header */}
            <div className="modal-header">
              <h2>{selectedIncident.title}</h2>
              <div className="modal-badges">
                <span
                  className={`priority-badge priority-${selectedIncident.priority}`}
                >
                  {selectedIncident.priority.toUpperCase()}
                </span>
                <span
                  className={`status-badge status-${selectedIncident.status}`}
                >
                  {selectedIncident.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Modal body */}
            <div className="modal-body">
              {/* Description */}
              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedIncident.description}</p>
              </div>

              {/* Tags */}
              {selectedIncident.tags.length > 0 && (
                <div className="modal-section">
                  <h3>Tags</h3>
                  <div className="incident-tags">
                    {selectedIncident.tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="modal-section">
                <h3>Metadata</h3>
                <div className="metadata-grid">
                  <div className="metadata-item">
                    <label>Created</label>
                    <span>{formatDate(selectedIncident.created_at)}</span>
                  </div>
                  <div className="metadata-item">
                    <label>Updated</label>
                    <span>{formatDate(selectedIncident.updated_at)}</span>
                  </div>
                  <div className="metadata-item">
                    <label>ID</label>
                    <span className="metadata-id">
                      {selectedIncident.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
