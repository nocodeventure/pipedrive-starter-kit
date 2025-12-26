import React from 'react';

import './style.css';

/**
 * Reusable tab navigation component for settings pages
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with { id, label } 
 * @param {string} props.activeTab - The currently active tab id
 * @param {Function} props.onTabChange - Callback when tab is clicked
 */
const SettingsNavigation = ({ tabs, activeTab, onTabChange }) => {
    return (
        <nav className="settings-navigation">
            <div className="settings-navigation__tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`settings-navigation__tab ${
                            activeTab === tab.id ? 'settings-navigation__tab--active' : ''
                        }`}
                        onClick={() => onTabChange(tab.id)}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default SettingsNavigation;

