import React from 'react';
import './styles.css';

const AgentCard = ({ agent, isSelected, onSelect }) => {
  return (
    <div className={`agent-card ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="agent-header">
        <div className="agent-icon">{agent.icon}</div>
        <div className="agent-info">
          <h4>{agent.name}</h4>
          <p className="agent-category">{agent.category}</p>
        </div>
      </div>
      
      <p className="agent-description">{agent.description}</p>
      
      <div className="agent-capabilities">
        {agent.capabilities.map((capability, index) => (
          <span key={index} className="capability-tag">
            {capability}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AgentCard;
