import React from 'react';

const MenuDisplay = ({ onInteraction }) => {
  return (
    <div 
      className="menu-display"
      onClick={onInteraction}
    >
      <div className="menu-container">
        <div className="menu-image-wrapper">
          <img 
            src="/menu_1.png" 
            alt="Menu Page 1" 
            className="menu-image"
          />
          <img 
            src="/menu_2.png" 
            alt="Menu Page 2" 
            className="menu-image"
          />
        </div>
        <div className="menu-overlay">
          <p>화면을 터치하여 주문을 시작하세요</p>
        </div>
      </div>
    </div>
  );
};

export default MenuDisplay;