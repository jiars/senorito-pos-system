import React, { useState, useRef, useEffect } from 'react';
import './customSelect.css';

const CustomSelect = ({ options, value, onChange, name, placeholder = "Select an option..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    // Mimic the event object for parent onChange handler
    const mockEvent = {
      target: {
        name: name,
        value: optionValue
      }
    };
    onChange(mockEvent);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div 
        className={`custom-select-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-select-selected">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className="bi bi-chevron-down custom-select-arrow"></i>
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
