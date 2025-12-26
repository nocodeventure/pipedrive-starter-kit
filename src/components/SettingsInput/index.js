import React from 'react';

import './style.css';

/**
 * Reusable input component for settings - handles both readonly display and dropdowns
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {string} [props.type='readonly'] - 'readonly' or 'select'
 * @param {Array} [props.options] - Options for select type [{ value, label }]
 * @param {Function} [props.onChange] - Callback for value changes
 */
const SettingsInput = ({ label, value, type = 'readonly', options = [], onChange }) => {
    return (
        <div className="settings-input">
            {label && <label className="settings-input__label">{label}</label>}
            {type === 'select' ? (
                <select 
                    className="settings-input__select"
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <div className="settings-input__value">{value || 'N/A'}</div>
            )}
        </div>
    );
};

export default SettingsInput;

