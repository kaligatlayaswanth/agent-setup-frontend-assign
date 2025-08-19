import React, { useState } from 'react';
import './styles.css';

const AgentInstanceSelectionScreen = ({ 
  agentInstances, 
  loading, 
  selectedAgentInstance, 
  selectedOrganization,
  onAgentInstanceSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Categories for filtering agent instances
  const categories = [
    'All Categories',
    'Finance',
    'Sales',
    'Marketing',
    'Customer Service',
    'Performance',
    'Logistics',
    'Administration'
  ];

  const filteredInstances = agentInstances.filter(instance => {
    const matchesSearch = instance.agent_instance_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (instance.agent_id && instance.agent_id.toString().includes(searchQuery.toLowerCase()));
    
    // Filter by category if not "All Categories"
    const matchesCategory = selectedCategory === 'All Categories' || 
                           instance.agent_instance_name.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <div className="agent-instance-selection-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading agent instances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-instance-selection-screen">
      {/* Left Sidebar - Categories Panel */}
      <div className="categories-panel">
        <div className="search-section">
          <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Search Agent Instances"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="categories-section">
          <h3>Agent Categories</h3>
          <div className="categories-list">
            {categories.map((category) => (
              <div
                key={category}
                className={`category-item ${selectedCategory === category ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="category-icon">📊</div>
                <span className="category-name">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content - Agent Instances Grid */}
      <div className="agents-content">
        <div className="content-header">
          <h2>{selectedCategory}</h2>
          <p>Select the agent instance you want to connect with data sources and create articles.</p>
        </div>

        <div className="agents-grid">
          {filteredInstances.length === 0 ? (
            <div className="no-agents-available">
              <div className="empty-state">
                <div className="empty-icon">🤖</div>
                <h4>No Agent Instances Available</h4>
                <p>No agent instances found for this organization and category.</p>
                <p>Create an agent instance first to proceed.</p>
              </div>
            </div>
          ) : (
            filteredInstances.map(instance => (
              <div
                key={instance.id}
                className={`agent-card ${selectedAgentInstance?.id === instance.id ? 'selected' : ''}`}
                onClick={() => onAgentInstanceSelect(instance)}
              >
                <div className="agent-card-top">
                  <div className="agent-icon">🤖</div>
                </div>
                <div className="agent-card-content">
                  <h3 className="agent-name">{instance.agent_instance_name}</h3>
                  <p className="agent-description">
                    {instance.configuration?.focus_areas?.length > 0 
                      ? `Specializes in: ${instance.configuration.focus_areas.join(', ')}`
                      : 'General purpose agent instance for data analysis and insights'
                    }
                  </p>
                  <div className="agent-category-tag">
                    {instance.configuration?.tone || 'Professional'} • {instance.configuration?.article_count || 5} articles
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selection Summary */}
        {selectedAgentInstance && (
          <div className="selection-summary">
            <h4>Selected Agent Instance</h4>
            <div className="selected-instance-info">
              <span className="instance-name">{selectedAgentInstance.agent_instance_name}</span>
              <span className="agent-type">Agent ID: {selectedAgentInstance.agent_id}</span>
              <span className="instance-status">
                {selectedAgentInstance.datasource ? '✅ Ready for data source' : '⚠️ Needs data source'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentInstanceSelectionScreen;
