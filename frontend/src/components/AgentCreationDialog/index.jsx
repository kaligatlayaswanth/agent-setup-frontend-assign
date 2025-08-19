import React, { useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { 
  openDialog, 
  closeDialog, 
  setCurrentStep, 
  selectAgentInstance,
  selectOrganization,
  connectDataSource,
  disconnectDataSource,
  setLoading,
  setError,
  setSuccess,
  resetDialog,
  addCompletedAgent
} from '../../store/slices/agentCreationSlice';
import { fetchAgentInstancesForOrganization, linkDataSourceToAgent, createArticles } from '../../store/slices/agentsSlice';
import { fetchDataSources } from '../../store/slices/dataSourcesSlice';
import { fetchOrganizations } from '../../store/slices/organizationsSlice';
import ProgressStepper from './ProgressStepper';
import OrganizationSelectionScreen from './OrganizationSelectionScreen';
import AgentInstanceSelectionScreen from './AgentInstanceSelectionScreen';
import DataSourceConnectionScreen from './DataSourceConnectionScreen';
import Navigation from './Navigation';
import './styles.css';

const AgentCreationDialog = () => {
  const dispatch = useAppDispatch();
  const { 
    isOpen, 
    currentStep, 
    selectedAgentInstance, 
    selectedOrganization,
    connectedDataSources,
    loading,
    error,
    success
  } = useAppSelector(state => state.agentCreation);

  const { organizationAgentInstances, loading: instancesLoading, linkingDataSource, creatingArticles } = useAppSelector(state => state.agents);
  const { items: dataSources, loading: dataSourcesLoading } = useAppSelector(state => state.dataSources);
  const { items: organizations, loading: organizationsLoading } = useAppSelector(state => state.organizations);

  useEffect(() => {
    if (isOpen) {
      // Fetch data when dialog opens
      dispatch(fetchDataSources());
      dispatch(fetchOrganizations());
    }
  }, [isOpen, dispatch]);

  // Fetch agent instances when organization is selected
  useEffect(() => {
    if (selectedOrganization && currentStep === 2) {
      dispatch(fetchAgentInstancesForOrganization(selectedOrganization.id));
    }
  }, [selectedOrganization, currentStep, dispatch]);

  const handleClose = () => {
    dispatch(closeDialog());
  };

  const handleNext = async () => {
    if (currentStep === 1 && selectedOrganization) {
      // Move to agent instance selection
      dispatch(setCurrentStep(2));
    } else if (currentStep === 2 && selectedAgentInstance) {
      // Move to data source connection
      dispatch(setCurrentStep(3));
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      dispatch(setCurrentStep(1));
    } else if (currentStep === 3) {
      dispatch(setCurrentStep(2));
    }
  };

  const handleFinish = async () => {
    if (connectedDataSources.length > 0 && selectedAgentInstance) {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        
        // Link data source to agent instance
        if (connectedDataSources.length > 0) {
          const datasourceId = connectedDataSources[0].id;
          await dispatch(linkDataSourceToAgent({ 
            instanceId: selectedAgentInstance.id, 
            datasourceId 
          })).unwrap();
        }

        // Don't generate articles here - just complete the setup
        dispatch(setSuccess('Agent setup completed successfully! You can now generate articles from the home screen.'));
        
        // Add the completed agent to the home screen agents list
        const completedAgent = {
          ...selectedAgentInstance,
          datasource: connectedDataSources[0].id,
          isSetupComplete: true,
          hasArticles: false
        };
        dispatch(addCompletedAgent(completedAgent));
        
        // Close dialog after successful completion
        setTimeout(() => {
          dispatch(closeDialog());
        }, 2000);
        
      } catch (error) {
        dispatch(setError(error.message || 'Failed to complete agent setup'));
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dialog-header">
          <h2>Add New Agent</h2>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Progress Stepper */}
        <ProgressStepper currentStep={currentStep} />

        {/* Error/Success Messages */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* Content */}
        <div className="dialog-body">
          {currentStep === 1 ? (
            <OrganizationSelectionScreen 
              organizations={organizations}
              loading={organizationsLoading}
              selectedOrganization={selectedOrganization}
              onOrganizationSelect={(org) => dispatch(selectOrganization(org))}
            />
          ) : currentStep === 2 ? (
            <AgentInstanceSelectionScreen 
              agentInstances={organizationAgentInstances}
              loading={instancesLoading}
              selectedAgentInstance={selectedAgentInstance}
              selectedOrganization={selectedOrganization}
              onAgentInstanceSelect={(instance) => dispatch(selectAgentInstance(instance))}
            />
          ) : (
            <DataSourceConnectionScreen 
              dataSources={dataSources}
              loading={dataSourcesLoading}
              selectedAgentInstance={selectedAgentInstance}
              connectedDataSources={connectedDataSources}
              onConnectDataSource={(ds) => dispatch(connectDataSource(ds))}
              onDisconnectDataSource={(id) => dispatch(disconnectDataSource(id))}
            />
          )}
        </div>

        {/* Navigation */}
        <Navigation 
          currentStep={currentStep}
          canGoNext={
            currentStep === 1 ? !!selectedOrganization :
            currentStep === 2 ? !!selectedAgentInstance :
            connectedDataSources.length > 0
          }
          canGoPrevious={currentStep > 1}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onFinish={handleFinish}
          onCancel={handleClose}
          loading={loading || instancesLoading || linkingDataSource || creatingArticles}
        />
      </div>
    </div>
  );
};

export default AgentCreationDialog;
