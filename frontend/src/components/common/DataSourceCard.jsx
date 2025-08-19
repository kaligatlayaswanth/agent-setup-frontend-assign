import React from 'react';
import './styles.css';

const DataSourceCard = ({ 
  dataSource, 
  isConnected = false,
  onConnect, 
  onDisconnect 
}) => {
  const handleAction = () => {
    if (isConnected) {
      onDisconnect();
    } else {
      onConnect();
    }
  };

  const getFileSize = (filePath) => {
    // Extract file size from path or use a default
    if (filePath && filePath.includes('sample_sales_data')) {
      return '2.4 MB';
    }
    return 'Unknown size';
  };

  const getLastUpdated = () => {
    // In a real app, this would come from the backend
    return '2024-01-15';
  };

  return (
    <div className={`data-source-card ${isConnected ? 'connected' : ''}`}>
      <div className="card-header">
        <div className="source-icon">
          {dataSource.source_type === 'csv' ? '📊' : '🔗'}
        </div>
        <div className="source-info">
          <h4>{dataSource.name}</h4>
          <span className="source-type">{dataSource.source_type?.toUpperCase() || 'Unknown'}</span>
        </div>
        <div className="connection-status">
          {isConnected && (
            <span className="status-badge connected">Added</span>
          )}
        </div>
      </div>

      <div className="card-body">
        <p className="description">{dataSource.description || 'No description available'}</p>
        
        <div className="source-details">
          <div className="detail-item">
            <span className="label">File:</span>
            <span className="value">{dataSource.file ? getFileSize(dataSource.file) : 'N/A'}</span>
          </div>
          
          {dataSource.date_column && (
            <div className="detail-item">
              <span className="label">Date Column:</span>
              <span className="value">{dataSource.date_column}</span>
            </div>
          )}
          
          <div className="detail-item">
            <span className="label">Last Updated:</span>
            <span className="value">{getLastUpdated()}</span>
          </div>
        </div>

        {dataSource.connection_params && Object.keys(dataSource.connection_params).length > 0 && (
          <div className="connection-params">
            <span className="label">Settings:</span>
            <div className="params-list">
              {Object.entries(dataSource.connection_params).map(([key, value]) => (
                <span key={key} className="param-tag">
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isConnected && (
        <div className="card-actions">
          <button
            className="action-button connect"
            onClick={handleAction}
          >
            Connect
          </button>
        </div>
      )}
    </div>
  );
};

export default DataSourceCard;
