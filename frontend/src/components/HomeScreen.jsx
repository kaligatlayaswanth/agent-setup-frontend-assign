import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { openDialog } from '../store/slices/agentCreationSlice';
import { createArticles, fetchArticlesForAgent } from '../store/slices/agentsSlice';
import { updateAgentArticles } from '../store/slices/agentCreationSlice';
import './HomeScreen.css';

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const { completedAgents } = useAppSelector(state => state.agentCreation);
  const { creatingArticles, loadingArticles, articlesByAgent, error } = useAppSelector(state => state.agents);
  const [generatingAgentId, setGeneratingAgentId] = useState(null);
  const [showArticles, setShowArticles] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleOpenDialog = () => {
    dispatch(openDialog());
  };

  const handleGenerateArticles = async (agent) => {
    try {
      setGeneratingAgentId(agent.id);
      
      // Generate articles for the agent
      await dispatch(createArticles({ 
        instanceId: agent.id, 
        articles: [] 
      })).unwrap();
      
      // Update agent to show it has articles
      dispatch(updateAgentArticles({ agentId: agent.id, hasArticles: true }));
      
      // Optionally load the articles immediately
      await dispatch(fetchArticlesForAgent(agent.id));
      
      // Show success message
      alert(`Articles generated successfully for ${agent.agent_instance_name}!`);
      
    } catch (error) {
      alert(`Failed to generate articles: ${error.message}`);
    } finally {
      setGeneratingAgentId(null);
    }
  };

  const handleViewArticles = async (agent) => {
    setSelectedAgent(agent);
    setShowArticles(true);
    // If we don't already have articles cached, fetch them
    if (!articlesByAgent[agent.id]) {
      await dispatch(fetchArticlesForAgent(agent.id));
    }
  };

  const handleBackToHome = () => {
    setShowArticles(false);
    setSelectedAgent(null);
  };

  if (showArticles && selectedAgent) {
    const articles = articlesByAgent[selectedAgent.id] || [];
    return (
      <div className="articles-page">
        <div className="articles-header">
          <button className="back-button" onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <h1>Articles for {selectedAgent.agent_instance_name}</h1>
        </div>

        <div className="articles-content">
          {loadingArticles && (
            <div className="articles-loading">Loading articles…</div>
          )}
          {error && (
            <div className="articles-error">{error}</div>
          )}
          {!loadingArticles && articles.length === 0 && (
            <div className="articles-empty">No articles found for this agent.</div>
          )}

          {!loadingArticles && articles.length > 0 && (
            <div className="articles-list">
              {articles.map(article => (
                <div key={article.id} className="article-card">
                  <div className="article-header">
                    <h3 className="article-title">{article.title}</h3>
                    <span className="article-date">{new Date(article.created_at).toLocaleString()}</span>
                  </div>
                  <div className="article-body">
                    <p className="article-content">{article.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="home-header">
        <div className="header-content">
          <h1>AI Agent Management</h1>
          <p>Manage your intelligent agents for data analysis and insights</p>
          <button className="add-agent-button" onClick={handleOpenDialog}>
            + Add New Agent
          </button>
        </div>
      </div>

      <div className="home-content">
        {completedAgents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h2>No Agents Created Yet</h2>
            <p>Create your first agent to get started with data analysis and insights.</p>
            <button className="cta-button" onClick={handleOpenDialog}>
              Create Your First Agent
            </button>
          </div>
        ) : (
          <div className="agents-section">
            <h2>Your Agents ({completedAgents.length})</h2>
            <div className="agents-grid">
              {completedAgents.map(agent => (
                <div key={agent.id} className="agent-card">
                  <div className="agent-header">
                    <div className="agent-icon">🤖</div>
                    <div className="agent-info">
                      <h3>{agent.agent_instance_name}</h3>
                      <span className="agent-status">
                        {agent.isSetupComplete ? '✅ Setup Complete' : '⏳ Setup Incomplete'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="agent-details">
                    <p className="agent-description">
                      {agent.configuration?.focus_areas?.length > 0 
                        ? `Specializes in: ${agent.configuration.focus_areas.join(', ')}`
                        : 'General purpose agent for data analysis and insights'
                      }
                    </p>
                    
                    <div className="agent-metrics">
                      <span className="metric">
                        📊 {agent.configuration?.article_count || 5} articles
                      </span>
                      <span className="metric">
                        🎯 {agent.configuration?.tone || 'Professional'} tone
                      </span>
                    </div>
                  </div>
                  
                  <div className="agent-actions">
                    {articlesByAgent[agent.id]?.length > 0 || agent.hasArticles ? (
                      <button 
                        className="view-articles-button"
                        onClick={() => handleViewArticles(agent)}
                      >
                        📄 View Articles
                      </button>
                    ) : (
                      <button 
                        className="generate-articles-button"
                        onClick={() => handleGenerateArticles(agent)}
                        disabled={creatingArticles && generatingAgentId === agent.id}
                      >
                        {creatingArticles && generatingAgentId === agent.id 
                          ? '🔄 Generating...' 
                          : '📝 Generate Articles'
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
