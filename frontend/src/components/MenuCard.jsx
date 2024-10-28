import React from 'react';

const MenuCard = ({ category, items, onAddToCart }) => {
  return (
    <div className="menu-category">
      <h3 className="category-title">{category}</h3>
      <div className="menu-grid">
        {items.map((item, index) => (
          <div key={index} className="menu-item-card" onClick={() => onAddToCart(item.name, item.price)}>
            <h4 className="menu-item-name">{item.name}</h4>
            <p className="menu-item-english">{item.english}</p>
            <p className="menu-item-price">{item.price.toLocaleString()}원</p>
            <div className="add-to-cart-overlay">
              <span>장바구니 추가 +</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuCard;