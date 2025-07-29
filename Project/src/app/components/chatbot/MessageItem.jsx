'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const MessageItem = ({ message, isBot, timestamp }) => {
  // שיפור הצגת הטקסט והנוסחאות המתמטיות
  const renderMathText = (text) => {
    if (!text) return '';

    const parts = [];
    let currentIndex = 0;
    
    // Regex מתקדם יותר לזיהוי LaTeX - תומך ב $$...$$ ו $...$
    const latexRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$|\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^\]]*\])*|\\[^a-zA-Z\s]|(?:\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\})/g;
    let match;

    while ((match = latexRegex.exec(text)) !== null) {
      // הוספת הטקסט הרגיל לפני הביטוי המתמטי
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: text.substring(currentIndex, match.index)
        });
      }

      // זיהוי סוג הביטוי המתמטי
      let mathContent = match[1] || match[2] || match[0]; // Display math, inline math, or raw LaTeX
      const isDisplayMath = match[1]; // $$...$$

      parts.push({
        type: 'math',
        content: mathContent,
        display: isDisplayMath
      });

      currentIndex = match.index + match[0].length;
    }

    // הוספת השאר של הטקסט
    if (currentIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(currentIndex)
      });
    }

    // רינדור החלקים
    return parts.map((part, index) => {
      if (part.type === 'math') {
        try {
          return part.display ? 
            <BlockMath key={index} math={part.content} /> :
            <InlineMath key={index} math={part.content} />;
        } catch (error) {
          // במקרה של שגיאה, נציג את הטקסט עם סימון שגיאה
          return <span key={index} className="bg-red-100 text-red-600 px-1 rounded text-sm">{part.content}</span>;
        }
      } else {
        return <span key={index}>{part.content}</span>;
      }
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isBot 
          ? 'bg-gray-400 text-gray-800' 
          : 'bg-blue-400 text-amber-300'
      }`}>
        <div className="break-words">
          {renderMathText(message)}
        </div>
        
        <div className={`text-xs mt-1 ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
