import React from 'react';
import { useAppSelector } from './hooks/useAppSelector';
import { useAppDispatch } from './hooks/useAppDispatch';
import { openDialog } from './store/slices/agentCreationSlice';
import AgentCreationDialog from './components/AgentCreationDialog';
import HomeScreen from './components/HomeScreen';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector(state => state.agentCreation);

  return (
    <div className="app">
      {/* Home Screen with Agent Management */}
      <HomeScreen />

      {/* Agent Creation Dialog */}
      {isOpen && <AgentCreationDialog />}
    </div>
  );
}

export default App;
