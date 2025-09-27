import React, { useState, useRef, useEffect } from 'react';
import './SimpleDropdown.css';

const SimpleDropdown = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="simple-dropdown" ref={dropdownRef}>
      <div className="simple-dropdown-trigger" onClick={handleTriggerClick}>
        {trigger}
      </div>
      {isOpen && (
        <div className="simple-dropdown-menu">
          {items.map((item, index) => (
            <div
              key={index}
              className={`simple-dropdown-item ${item.danger ? 'danger' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <span className="simple-dropdown-icon">{item.icon}</span>}
              <span className="simple-dropdown-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleDropdown;
