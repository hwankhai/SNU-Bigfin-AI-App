import { useState } from 'react'
import './App.css'
import MenuDisplay from './components/MenuDisplay'
import MenuCard from './components/MenuCard'
import { menuData } from './data/menuData'

function App() {
  // 상태 관리
  const [showMenu, setShowMenu] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderStep, setOrderStep] = useState('chat');
  const [orderType, setOrderType] = useState('');

  // 메뉴 화면 클릭 핸들러
  const handleMenuInteraction = () => {
    setShowMenu(false);
    setOrderStep('chat');
  };

  // 장바구니 추가 핸들러
  const handleAddToCart = (menuName, price, quantity = 1) => {
    // 이미 장바구니에 있는 상품인지 확인
    const existingItem = cart.find(item => item.name === menuName);
    
    if (existingItem) {
      // 이미 있는 경우 수량만 증가
      setCart(cart.map(item =>
        item.name === menuName
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      // 새로운 아이템 추가
      setCart([...cart, {
        name: menuName,
        quantity,
        price
      }]);
    }
  };

  // 챗봇 메시지 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: userMessage.content }),
      });

      const data = await response.json();
      
      const botMessage = {
        type: 'bot',
        content: data.response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        type: 'bot',
        content: '죄송합니다. 일시적인 오류가 발생했습니다.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 챗봇 메시지에서 메뉴 감지 및 버튼 렌더링
  const renderBotMessage = (content) => {
    const menuMention = Object.values(menuData)
      .flat()
      .find(item => content.includes(item.name));

    return (
      <div>
        <div>{content}</div>
        {menuMention && (
          <button
            className="menu-add-button"
            onClick={() => handleAddToCart(menuMention.name, menuMention.price)}
          >
            {menuMention.name} 장바구니 추가 +
          </button>
        )}
      </div>
    );
  };

  // 주문 시작
  const startOrder = () => {
    setOrderStep('orderType');
  };

  // 주문 타입 선택
  const selectOrderType = (type) => {
    setOrderType(type);
    setOrderStep('menu');
  };

  // 결제 단계로 이동
  const proceedToPayment = () => {
    setOrderStep('payment');
  };

  // 주문 완료
  const completeOrder = () => {
    setOrderStep('complete');
    // 5초 후 초기화
    setTimeout(() => {
      setOrderStep('chat');
      setCart([]);
      setOrderType('');
      setShowMenu(true);
    }, 5000);
  };

  // 메뉴 선택 화면 렌더링
  const renderMenuSelection = () => (
    <div className="menu-selection">
      <h2>메뉴를 선택해주세요</h2>
      <div className="menu-categories">
        {Object.entries(menuData).map(([category, items]) => (
          <MenuCard
            key={category}
            category={category}
            items={items}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
      {cart.length > 0 && (
        <button onClick={proceedToPayment} className="proceed-button">
          결제하기
        </button>
      )}
    </div>
  );

  // 단계별 화면 렌더링
  const renderOrderStep = () => {
    switch(orderStep) {
      case 'orderType':
        return (
          <div className="order-type-selection">
            <h2>주문 방식을 선택해주세요</h2>
            <div className="order-type-buttons">
              <button onClick={() => selectOrderType('instore')}>먹고 가기</button>
              <button onClick={() => selectOrderType('takeout')}>가져 가기</button>
            </div>
          </div>
        );
      
      case 'menu':
        return renderMenuSelection();
      
      case 'payment':
        return (
          <div className="payment-confirmation">
            <h2>주문 확인</h2>
            <div className="order-summary">
              <p>주문 방식: {orderType === 'instore' ? '먹고 가기' : '가져 가기'}</p>
              <h3>주문 내역</h3>
              <ul>
                {cart.map((item, index) => (
                  <li key={index}>
                    {item.name} - {item.quantity}개 - {item.price * item.quantity}원
                  </li>
                ))}
              </ul>
              <div className="total">
                총계: {cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}원
              </div>
            </div>
            <button onClick={completeOrder} className="complete-button">
              결제하기
            </button>
          </div>
        );
      
      case 'complete':
        return (
          <div className="order-complete">
            <h2>주문이 완료되었습니다!</h2>
            <p>잠시 후 초기 화면으로 돌아갑니다.</p>
          </div>
        );
      
      default:
        return (
          <div>
            <div className="chat-area">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  {message.type === 'bot' 
                    ? renderBotMessage(message.content)
                    : message.content
                  }
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  입력 중...
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="메뉴를 추천해드릴까요?"
                className="message-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={isLoading}
              >
                전송
              </button>
            </form>
            <button onClick={startOrder} className="start-order-button">
              주문하기
            </button>
          </div>
        );
    }
  };

  // 메인 렌더링
  if (showMenu) {
    return <MenuDisplay onInteraction={handleMenuInteraction} />;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>메가커피 키오스크</h1>
      </header>

      <main className="main-content">
        {renderOrderStep()}
      </main>

      <aside className="cart">
        <h2>장바구니</h2>
        {cart.length === 0 ? (
          <p>장바구니가 비어있습니다</p>
        ) : (
          <div>
            <p>주문 방식: {orderType === 'instore' ? '먹고 가기' : '가져 가기'}</p>
            <ul>
              {cart.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.quantity}개 - {item.price * item.quantity}원
                </li>
              ))}
            </ul>
            <div className="cart-total">
              총계: {cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}원
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default App