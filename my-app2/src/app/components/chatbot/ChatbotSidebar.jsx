'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../firebase/config';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import { comprehensiveMathAnalysis } from './mathTextAnalyzer';
import 'katex/dist/katex.min.css';

const ChatbotSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMathKeyboardOpen, setIsMathKeyboardOpen] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [user, loading] = useAuthState(auth);
  const messagesEndRef = useRef(null);

  // Debug logging for auth state
  useEffect(() => {
    console.log('Auth state:', { user: !!user, loading, userId: user?.uid });
  }, [user, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      where('type', '==', 'math_tutor'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatHistory = [];
      const analysisData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // הוספת הודעות לצ'אט
        chatHistory.push({
          id: `${doc.id}_user`,
          message: data.userMessage,
          isBot: false,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          metadata: {
            correctedMessage: data.correctedMessage,
            difficulty: data.difficulty,
            mathContexts: data.mathContexts,
            corrections: data.corrections
          }
        });
        
        chatHistory.push({
          id: `${doc.id}_bot`,
          message: data.botResponse,
          isBot: true,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        });

        // שמירת נתוני ניתוח
        if (data.difficulty || data.mathContexts || data.corrections) {
          analysisData.push({
            id: doc.id,
            userMessage: data.userMessage,
            correctedMessage: data.correctedMessage,
            difficulty: data.difficulty,
            mathContexts: data.mathContexts,
            corrections: data.corrections,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
          });
        }
      });
      
      setMessages(chatHistory);
      setAnalysisHistory(analysisData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSendMessage = async (message) => {
    if (!user) {
      alert("אנא התחבר כדי להשתמש בצ'אט");
      return;
    }

    setIsLoading(true);

    const userMessage = {
      id: Date.now() + '_user',
      message,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: user.uid
        })
      });

      const data = await response.json();

      if (!data.success) {
        const errorMessage = {
          id: Date.now() + '_error',
          message: `שגיאה: ${data.error || 'Unknown error'}`,
          isBot: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = {
        id: Date.now() + '_error',
        message: 'שגיאה בשליחת ההודעה. אנא נסה שוב.',
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMathKeyboard = () => {
    setIsMathKeyboardOpen(prev => !prev);
  };

  // רכיב הצגת מידע מטא-דטה בהודעות
  const MessageWithMetadata = ({ msg }) => {
    const [showMetadata, setShowMetadata] = useState(false);
    
    return (
      <div className="group">
        <MessageItem
          key={msg.id}
          message={msg.message}
          isBot={msg.isBot}
          timestamp={msg.timestamp}
        />
        
        {/* הצגת מטא-דטה למשתמש */}
        {!msg.isBot && (msg.metadata || msg.analysis) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              פרטי ניתוח
            </button>
            
            {showMetadata && (
              <div className="bg-gray-50 rounded p-2 mt-1 text-xs space-y-1">
                {(msg.metadata?.corrections || msg.analysis?.corrections) && 
                 (msg.metadata?.corrections?.length > 0 || msg.analysis?.corrections?.length > 0) && (
                  <div>
                    <span className="font-medium">תוקנו:</span>
                    {(msg.metadata?.corrections || msg.analysis?.corrections)?.map((correction, idx) => (
                      <span key={idx} className="ml-1 text-orange-600">
                        {typeof correction === 'string' ? correction : `${correction.original}→${correction.corrected}`}
                      </span>
                    ))}
                  </div>
                )}
                
                {(msg.metadata?.difficulty || msg.analysis?.complexity?.level) && (
                  <div>
                    <span className="font-medium">רמה:</span>
                    <span className="ml-1 text-blue-600">
                      {msg.metadata?.difficulty || msg.analysis?.complexity?.level}
                    </span>
                  </div>
                )}
                
                {(msg.metadata?.mathContexts || msg.analysis?.contexts) && 
                 (msg.metadata?.mathContexts?.length > 0 || msg.analysis?.contexts?.length > 0) && (
                  <div>
                    <span className="font-medium">תחום:</span>
                    <span className="ml-1 text-green-600">
                      {msg.metadata?.mathContexts?.[0]?.context || msg.analysis?.contexts?.[0]?.category}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Only render the chat button and sidebar if user is authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="פתח צ'אט מתמטיקה"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-transparent z-40 pointer-events-none" />
      )}

      <div className={`fixed top-0 right-0 h-[calc(100vh-48px)] w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 mt-4 bg-blue-500 rounded-t-lg mx-2 border-b border-gray-200" dir="rtl">
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-right">
              <h2 className="text-lg font-semibold text-white">מורה למתמטיקה - 3 יחידות</h2>
              {Math.floor(messages.length / 2) > 0 && (
                <span className="text-xs text-blue-100">
                  {Math.floor(messages.length / 2)} שאלות נשאלו
                </span>
              )}
            </div>
            <span className="text-2xl">🧮</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="סגור צ'אט"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-4 ${isMathKeyboardOpen ? 'h-[calc(100vh-336px)]' : 'h-[calc(100vh-248px)]'}`} dir="rtl">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">🎓</div>
              <p className="text-lg font-medium mb-2">ברוך הבא למורה המתמטיקה המתקדם!</p>
              <p className="text-sm mb-2">שאל שאלות במתמטיקה ברמת 3 יחידות</p>
              <div className="text-xs text-gray-400 bg-gray-50 rounded p-2 mt-4">
                <p className="mb-1">🔍 הבוט מזהה שגיאות הקלדה אוטומטית</p>
                <p className="mb-1">📊 מנתח רמת קושי וסוג שאלות</p>
                <p>🧠 זוכר הקשר קודם לתשובות מדויקות יותר</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageWithMetadata key={msg.id} msg={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-blue-100 text-blue-900 border border-blue-200 rounded-lg px-4 py-3 max-w-[85%] md:max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm">המורה מנתח ועונה...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          onToggleMathKeyboard={handleToggleMathKeyboard}
          isMathKeyboardOpen={isMathKeyboardOpen}
        />
      </div>
    </>
  );
};

export default ChatbotSidebar;