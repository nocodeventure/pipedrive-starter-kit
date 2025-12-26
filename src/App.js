import React from "react";

import TodoList from './components/TodoList';
import SettingsPage from './components/Settings/SettingsPage';

import './App.css';

function App() {
  const isSettings = window.location.pathname === '/settings';

  if (isSettings) {
    return <SettingsPage />;
  }

  return (
    <div className="App">
      <TodoList />
    </div>
  );
}

export default App;
