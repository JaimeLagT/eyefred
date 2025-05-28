import React from 'react';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import "./Toggle.css";

export const Toggle = ({ handleChange, isChecked }) => {
    return (
        <div className="toggle-container">
            {/* Hidden checkbox for the toggle logic */}
            <input
                type="checkbox"
                id="check"
                className="toggle-input"
                onChange={handleChange}
                checked={isChecked}
            />
            {/* Label now shows the sun or moon icon */}
            <label htmlFor="check" className="toggle">
                {isChecked
                    ? <MdDarkMode className="toggle-icon" aria-label="Dark Mode" />
                    : <MdLightMode className="toggle-icon" aria-label="Light Mode" />
                }
            </label>
        </div>
    );
}
