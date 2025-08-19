import React from 'react';
import './styles.css';

const Navigation = ({ 
  currentStep, 
  canGoNext, 
  canGoPrevious, 
  onNext, 
  onPrevious, 
  onFinish, 
  onCancel,
  loading = false
}) => {
  const getButtonText = () => {
    if (loading) {
      if (currentStep === 1) return 'Loading...';
      if (currentStep === 2) return 'Loading...';
      if (currentStep === 3) return 'Completing Setup...';
      return 'Processing...';
    }
    
    if (currentStep === 1) return 'Next: Select Agent Instance';
    if (currentStep === 2) return 'Next: Connect Data Source';
    if (currentStep === 3) return 'Finish: Complete Setup';
    return 'Next';
  };

  const isLastStep = currentStep === 3;

  return (
    <div className="dialog-navigation">
      <div className="navigation-buttons">
        {canGoPrevious && (
          <button 
            className="nav-button secondary"
            onClick={onPrevious}
            disabled={loading}
          >
            ← Previous
          </button>
        )}
        
        <div className="right-buttons">
          <button 
            className="nav-button secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          
          {isLastStep ? (
            <button 
              className="nav-button primary"
              onClick={onFinish}
              disabled={!canGoNext || loading}
            >
              {getButtonText()}
            </button>
          ) : (
            <button 
              className="nav-button primary"
              onClick={onNext}
              disabled={!canGoNext || loading}
            >
              {getButtonText()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
