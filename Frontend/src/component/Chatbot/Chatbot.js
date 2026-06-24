import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm MediBot 👋. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const API_BASE_URL = 'http://10.122.186.205:8000';

    const getPatientEmail = () => {
        try {
            const userData = localStorage.getItem('medicareUser');
            if (userData) {
                const user = JSON.parse(userData);
                if (user.email) {
                    return user.email;
                }
            }
            let email = localStorage.getItem('user_email');
            if (!email) email = localStorage.getItem('email');
            return email || null;
        } catch (e) {
            console.error('Error getting email:', e);
            return null;
        }
    };

    const patientEmail = getPatientEmail();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        const body = document.body;
        
        if (!isOpen) {
            body.classList.add('chatbot-open');
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.height = '100%';
        } else {
            body.classList.remove('chatbot-open');
            body.style.overflow = '';
            body.style.position = '';
            body.style.width = '';
            body.style.height = '';
        }
    };

    // 🔥 FIXED: Remove the ** replacement
    const formatResponse = (text) => {
        let formatted = text;
        formatted = formatted.replace(/\\n/g, '\n');
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        // ✅ REMOVED: formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '**$1**');
        return formatted.trim();
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const currentEmail = getPatientEmail();

        try {
            const response = await fetch(`${API_BASE_URL}/api/chatbot/message/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: input,
                    patient_email: currentEmail
                }),
            });

            const data = await response.json();

            if (data.success) {
                const formattedText = formatResponse(data.response);
                const botMessage = { 
                    text: formattedText, 
                    sender: 'bot', 
                    isMarkdown: true 
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                const errorMessage = { text: "Sorry, I'm having trouble responding. Please try again.", sender: 'bot' };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = { text: "Network error. Please check your connection.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const quickReplies = [
        { text: "📅 Book Appointment", action: "I want to book an appointment" },
        { text: "📋 My Appointments", action: "Show my appointments" },
        { text: "🩺 Doctor List", action: "Show me list of doctors" },
        { text: "❓ Help", action: "What can you help me with?" },
    ];

    return (
        <>
            {isOpen && <div className="chatbot-backdrop-overlay" onClick={toggleChat}></div>}

            <button 
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`} 
                onClick={toggleChat}
            >
                <span className="chatbot-icon">
                    {isOpen ? '✕' : '💬'}
                </span>
                {!isOpen && <span className="online-badge"></span>}
                <span className="tooltip">Chat with MediBot</span>
            </button>

            {isOpen && (
                <div className={`chatbot-window ${!isOpen ? 'welcome' : ''}`}>
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <span className="chatbot-avatar">🤖</span>
                            <div>
                                <h3>MediBot</h3>
                                <p>
                                    <span className="status-dot"></span>
                                    Online • Always here to help
                                </p>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={toggleChat}>✕</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chatbot-message ${msg.sender === 'user' ? 'user' : 'bot'}`}
                            >
                                <div className="chatbot-message-content">
                                    {msg.sender === 'bot' && <span className="chatbot-message-avatar">🤖</span>}
                                    
                                    {msg.isMarkdown ? (
                                        <div className="chatbot-markdown">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p>{children}</p>,
                                                    strong: ({ children }) => <strong>{children}</strong>,
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                    
                                    {msg.sender === 'user' && <span className="chatbot-message-avatar-user">👤</span>}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-message bot">
                                <div className="chatbot-message-content">
                                    <span className="chatbot-message-avatar">🤖</span>
                                    <div className="chatbot-typing">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-quick-replies">
                        {quickReplies.map((reply, index) => (
                            <button
                                key={index}
                                className="chatbot-quick-reply-btn"
                                onClick={() => {
                                    setInput(reply.action);
                                    setTimeout(sendMessage, 100);
                                }}
                            >
                                {reply.text}
                            </button>
                        ))}
                    </div>

                    <div className="chatbot-input-container">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                            {isLoading ? '...' : '➤'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chatbot;