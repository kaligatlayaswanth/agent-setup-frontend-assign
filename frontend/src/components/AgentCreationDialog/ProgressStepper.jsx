import React from 'react';
import './styles.css';

const ProgressStepper = ({ currentStep }) => {
  // For step 3 (Data Sources), show only 2 steps: Configure Agent ✓ and Data Sources
  if (currentStep === 3) {
    return (
      <div className="progress-stepper">
        <div className="step completed">
          <div className="step-number">✓</div>
          <div className="step-content">
            <h4>Configure Agent</h4>
            <p>Agent configuration completed</p>
          </div>
        </div>
        <div className="step-connector completed"></div>
        <div className="step active">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Data Sources</h4>
            <p>Connect data sources to your agent</p>
          </div>
        </div>
      </div>
    );
  }

  // For other steps, show the full 3-step progress
  const steps = [
    { number: 1, title: 'Organization', description: 'Select Organization' },
    { number: 2, title: 'Agent Instance', description: 'Choose Agent Instance' },
    { number: 3, title: 'Data Source', description: 'Connect Data Source' }
  ];

  return (
    <div className="progress-stepper">
      {steps.map((step, index) => (
        <div key={step.number} className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
          <div className="step-number">
            {currentStep > step.number ? '✓' : step.number}
          </div>
          <div className="step-content">
            <h4>{step.title}</h4>
            <p>{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={`step-connector ${currentStep > step.number ? 'completed' : ''}`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressStepper;
