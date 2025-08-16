import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';

// CSS样式对象
const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: '1',
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  userMessageWrapper: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatar: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  botAvatar: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    wordWrap: 'break-word',
    lineHeight: '1.5',
  },
  userMessage: {
    backgroundColor: '#667eea',
    color: 'white',
    borderBottomRightRadius: '6px',
  },
  botMessage: {
    backgroundColor: 'white',
    color: '#374151',
    borderBottomLeftRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  inputContainer: {
    padding: '20px',
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: '1',
    position: 'relative',
  },
  textarea: {
    width: '100%',
    minHeight: '44px',
    maxHeight: '120px',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '22px',
    fontSize: '16px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  },
  textareaFocused: {
    borderColor: '#667eea',
  },
  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    flexShrink: 0,
  },
  sendButtonHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  sendButtonDisabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
    transform: 'none',
  },
  loadingMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '8px',
    textAlign: 'center',
  },
  emptyState: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: '40px',
  },
  emptyStateIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 16px',
    color: '#d1d5db',
  }
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 自动调整textarea高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // 发送消息到Cloudflare Worker
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      // 替换为您的Cloudflare Worker URL
      const response = await fetch('https://ai-worker.251376168.workers.dev/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          conversation_id: 'chat_' + Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.response || data.message || '抱歉，我无法处理您的请求。',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('发送消息失败:', err);
      const errorMessage = {
        id: Date.now() + 1,
        text: '抱歉，连接服务器时出现问题。请检查网络连接或稍后再试。',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setError('连接失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 渲染消息
  const renderMessage = (message) => {
    const isUser = message.sender === 'user';

    return (
      <div
        key={message.id}
        style={{
          ...styles.messageWrapper,
          ...(isUser ? styles.userMessageWrapper : {}),
        }}
      >
        <div style={{
          ...styles.avatar,
          ...(isUser ? styles.userAvatar : styles.botAvatar),
        }}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
        <div style={{
          ...styles.messageBubble,
          ...(isUser ? styles.userMessage : styles.botMessage),
        }}>
          {message.text}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.chatContainer}>
      {/* 头部 */}
      <header style={styles.header}>
        <h1 style={styles.title}>AI 智能助手</h1>
      </header>

      {/* 消息区域 */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <Bot style={styles.emptyStateIcon} />
            <h3>开始对话</h3>
            <p>我是您的AI助手，有什么可以帮助您的吗？</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div style={{
            ...styles.messageWrapper,
          }}>
            <div style={{
              ...styles.avatar,
              ...styles.botAvatar,
            }}>
              <Bot size={20} />
            </div>
            <div style={{
              ...styles.messageBubble,
              ...styles.botMessage,
            }}>
              <div style={styles.loadingMessage}>
                <Loader size={16} className="animate-spin" />
                正在思考...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="输入您的消息..."
            style={{
              ...styles.textarea,
              ...(isFocused ? styles.textareaFocused : {}),
            }}
            rows={1}
          />
          {error && <div style={styles.errorMessage}>{error}</div>}
        </div>

        <button
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading}
          style={{
            ...styles.sendButton,
            ...((!inputValue.trim() || isLoading) ? styles.sendButtonDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              Object.assign(e.target.style, styles.sendButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, styles.sendButton);
          }}
        >
          {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default App;