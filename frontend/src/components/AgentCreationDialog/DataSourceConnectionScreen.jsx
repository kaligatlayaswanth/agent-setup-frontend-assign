import React, { useState } from 'react';
import DataSourceCard from '../common/DataSourceCard';
import './styles.css';

const DataSourceConnectionScreen = ({ 
  dataSources, 
  loading, 
  selectedAgentInstance, 
  connectedDataSources,
  onConnectDataSource, 
  onDisconnectDataSource 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Filter data sources based on search and type
  const filteredDataSources = dataSources.filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (ds.description && ds.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || ds.source_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleConnectDataSource = (dataSource) => {
    // Only allow one data source to be connected at a time
    if (connectedDataSources.length > 0) {
      onDisconnectDataSource(connectedDataSources[0].id);
    }
    onConnectDataSource(dataSource);
  };

  const handleDisconnectDataSource = (dataSourceId) => {
    onDisconnectDataSource(dataSourceId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Create a fake event object to reuse the existing upload logic
      const fakeEvent = { target: { files: [file] } };
      handleFileUpload(fakeEvent);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please select a valid CSV file. Only .csv files are supported.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File size too large. Please select a file smaller than 10MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes');

      const response = await fetch('http://localhost:8000/data-sources/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const uploadedDataSource = await response.json();
      console.log('Upload successful:', uploadedDataSource);
      
      setUploadSuccess(`Successfully uploaded ${file.name}! The data source is now available for connection.`);
      
      // Automatically connect the newly uploaded data source
      handleConnectDataSource(uploadedDataSource);
      
      // Clear the file input
      event.target.value = '';
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(null);
      }, 5000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
      
      // Clear error message after 10 seconds
      setTimeout(() => {
        setUploadError(null);
      }, 10000);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading data sources...</p>
      </div>
    );
  }

  return (
    <div className="data-source-connection-screen">
      <div className="data-sources-layout">
        {/* Left Side - Data Sources Content */}
        <div className="data-sources-content">
          {/* Search and Filter - At the top */}
          <div className="filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search data sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="type-filter">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="type-select"
              >
                <option value="all">All Types</option>
                <option value="csv">CSV Files</option>
                <option value="database">Database</option>
                <option value="api">API</option>
              </select>
            </div>
          </div>

          {/* File Upload Section - Collapsed */}
          <div className="upload-section-collapsed">
            <button 
              className="upload-toggle-button"
              onClick={() => setShowUpload(!showUpload)}
            >
              📁 Upload New CSV File
            </button>
            
            {showUpload && (
              <div 
                className={`upload-section ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <h4>Upload New CSV File</h4>
                <div className="upload-container">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="file-upload-input"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="file-upload-label">
                    {uploading ? 'Uploading...' : isDragOver ? 'Drop CSV file here' : 'Choose CSV File or Drag & Drop'}
                  </label>
                  {uploading && <div className="upload-progress">Uploading...</div>}
                </div>
                
                <div className="upload-instructions">
                  <p>📁 Supported formats: CSV files only</p>
                  <p>📏 Maximum file size: 10MB</p>
                  <p>🔗 Files will be automatically connected to your agent instance</p>
                </div>
                
                {uploadError && (
                  <div className="upload-error">
                    ❌ {uploadError}
                  </div>
                )}
                
                {uploadSuccess && (
                  <div className="upload-success">
                    ✅ {uploadSuccess}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Data Sources in your Workspace */}
          <div className="data-sources-section">
            <h4>Data Sources in your Workspace ({filteredDataSources.length})</h4>
            
            {filteredDataSources.length > 0 ? (
              <div className="data-sources-grid">
                                 {filteredDataSources.map(dataSource => (
                   <DataSourceCard
                     key={dataSource.id}
                     dataSource={dataSource}
                     isConnected={connectedDataSources.some(ds => ds.id === dataSource.id)}
                     onConnect={() => handleConnectDataSource(dataSource)}
                     onDisconnect={() => handleDisconnectDataSource(dataSource.id)}
                   />
                 ))}
              </div>
            ) : (
              <div className="no-data-sources">
                <p>No data sources found matching your criteria.</p>
                <p>Try adjusting your search or type filter, or upload a new CSV file above.</p>
              </div>
            )}
          </div>

          {/* Agent Data Sources - Connected Sources */}
          <div className="agent-data-sources-section">
            <h4>Agent Data Sources ({connectedDataSources.length})</h4>
            
            {connectedDataSources.length > 0 ? (
              <div className="connected-sources-tags">
                {connectedDataSources.map(dataSource => (
                  <div key={dataSource.id} className="connected-source-tag">
                    <span className="source-name">{dataSource.name}</span>
                    <button
                      className="remove-source-button"
                      onClick={() => handleDisconnectDataSource(dataSource.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-connected-sources">
                <p>No Data Sources have been added.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Agent Summary */}
        <div className="agent-summary-panel">
          <h4>Agent Summary</h4>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Agent Type:</span>
              <span className="summary-value">{selectedAgentInstance?.agent_type || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Agent Name:</span>
              <span className="summary-value">{selectedAgentInstance?.agent_instance_name || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Status:</span>
              <span className="summary-value">
                {connectedDataSources.length > 0 ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Data Sources:</span>
              <span className="summary-value">{connectedDataSources.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceConnectionScreen;
