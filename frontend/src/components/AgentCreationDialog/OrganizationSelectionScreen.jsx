import React, { useState } from 'react';
import SearchBar from '../common/SearchBar';
import './styles.css';

const OrganizationSelectionScreen = ({ 
  organizations, 
  loading, 
  selectedOrganization, 
  onOrganizationSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="screen-container">
        <div className="loading-spinner">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h3>Step 1: Select Organization</h3>
        <p>Choose the organization for your agent setup</p>
      </div>

      <div className="search-section">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search organizations..."
        />
      </div>

      <div className="organizations-grid">
        {filteredOrganizations.length === 0 ? (
          <div className="empty-state">
            <p>No organizations found</p>
            <p>Create an organization first to proceed</p>
          </div>
        ) : (
          filteredOrganizations.map(org => (
            <div
              key={org.id}
              className={`organization-card ${selectedOrganization?.id === org.id ? 'selected' : ''}`}
              onClick={() => onOrganizationSelect(org)}
            >
              <div className="organization-icon">🏢</div>
              <div className="organization-info">
                <h4>{org.name}</h4>
                <p className="organization-status">
                  {org.is_demo ? 'Demo Organization' : 'Production Organization'}
                </p>
                <p className="data-source-status">
                  {org.data_source_connected ? '✅ Data Source Connected' : '❌ No Data Source'}
                </p>
              </div>
              {selectedOrganization?.id === org.id && (
                <div className="selection-indicator">✓</div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedOrganization && (
        <div className="selection-summary">
          <h4>Selected Organization</h4>
          <div className="selected-org-info">
            <span className="org-name">{selectedOrganization.name}</span>
            <span className="org-type">
              {selectedOrganization.is_demo ? 'Demo' : 'Production'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSelectionScreen;
