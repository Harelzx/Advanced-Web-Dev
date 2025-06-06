'use client';

import React, { useState, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const ChatInput = ({ onSendMessage, isLoading, onToggleMathKeyboard, isMathKeyboardOpen }) => {
  const [message, setMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('basic');
  const textareaRef = useRef(null);

  const mathCategories = {
    basic: {
      name: 'בסיסי',
      symbols: [
        { symbol: '\\frac{a}{b}', display: '𝑎/𝑏', insert: '\\frac{ }{ }', cursorOffset: 2 },
        { symbol: 'x^{2}', display: 'x²', insert: '^{ }', cursorOffset: 1 },
        { symbol: '\\sqrt{x}', display: '√', insert: '\\sqrt{ }', cursorOffset: 1 },
        { symbol: '\\sqrt[n]{x}', display: 'ⁿ√', insert: '\\sqrt[ ]{ }', cursorOffset: 1 },
        { symbol: '\\pi', display: 'π', insert: '\\pi', cursorOffset: 0 },
        { symbol: '\\infty', display: '∞', insert: '\\infty', cursorOffset: 0 },
        { symbol: '\\pm', display: '±', insert: '\\pm', cursorOffset: 0 },
        { symbol: '\\mp', display: '∓', insert: '\\mp', cursorOffset: 0 },
        { symbol: '\\times', display: '×', insert: '\\times', cursorOffset: 0 },
        { symbol: '\\div', display: '÷', insert: '\\div', cursorOffset: 0 },
        { symbol: '\\cdot', display: '·', insert: '\\cdot', cursorOffset: 0 },
        { symbol: '\\neq', display: '≠', insert: '\\neq', cursorOffset: 0 },
        { symbol: '\\leq', display: '≤', insert: '\\leq', cursorOffset: 0 },
        { symbol: '\\geq', display: '≥', insert: '\\geq', cursorOffset: 0 },
        { symbol: '\\approx', display: '≈', insert: '\\approx', cursorOffset: 0 },
        { symbol: '\\propto', display: '∝', insert: '\\propto', cursorOffset: 0 },
        { symbol: '()', display: '( )', insert: '( )', cursorOffset: 2 },
        { symbol: '[]', display: '[ ]', insert: '[ ]', cursorOffset: 2 },
        { symbol: '{}', display: '{ }', insert: '\\{ \\}', cursorOffset: 3 }
      ]
    },
    functions: {
      name: 'פונקציות',
      symbols: [
        { symbol: '\\sin(x)', display: 'sin', insert: '\\sin( )', cursorOffset: 1 },
        { symbol: '\\cos(x)', display: 'cos', insert: '\\cos( )', cursorOffset: 1 },
        { symbol: '\\tan(x)', display: 'tan', insert: '\\tan( )', cursorOffset: 1 },
        { symbol: '\\cot(x)', display: 'cot', insert: '\\cot( )', cursorOffset: 1 },
        { symbol: '\\sec(x)', display: 'sec', insert: '\\sec( )', cursorOffset: 1 },
        { symbol: '\\csc(x)', display: 'csc', insert: '\\csc( )', cursorOffset: 1 },
        { symbol: '\\arcsin(x)', display: 'arcsin', insert: '\\arcsin( )', cursorOffset: 1 },
        { symbol: '\\arccos(x)', display: 'arccos', insert: '\\arccos( )', cursorOffset: 1 },
        { symbol: '\\arctan(x)', display: 'arctan', insert: '\\arctan( )', cursorOffset: 1 },
        { symbol: '\\ln(x)', display: 'ln', insert: '\\ln( )', cursorOffset: 1 },
        { symbol: '\\log(x)', display: 'log', insert: '\\log( )', cursorOffset: 1 },
        { symbol: '\\log_{b}(x)', display: 'logₐ', insert: '\\log_{ }( )', cursorOffset: 2 },
        { symbol: 'e^{x}', display: 'eˣ', insert: 'e^{ }', cursorOffset: 1 },
        { symbol: '|x|', display: '|x|', insert: '| |', cursorOffset: 1 },
        { symbol: '\\lfloor x \\rfloor', display: '⌊x⌋', insert: '\\lfloor  \\rfloor', cursorOffset: 8 },
        { symbol: '\\lceil x \\rceil', display: '⌈x⌉', insert: '\\lceil  \\rceil', cursorOffset: 7 }
      ]
    },
    calculus: {
      name: 'חדו״א',
      symbols: [
        { symbol: '\\lim_{x\\to a}', display: 'lim', insert: '\\lim_{ \\to }', cursorOffset: 5 },
        { symbol: '\\int', display: '∫', insert: '\\int ', cursorOffset: 0 },
        { symbol: '\\int_{a}^{b}', display: '∫ᵇₐ', insert: '\\int_{ }^{ } ', cursorOffset: 2 },
        { symbol: '\\oint', display: '∮', insert: '\\oint ', cursorOffset: 0 },
        { symbol: '\\sum', display: '∑', insert: '\\sum ', cursorOffset: 0 },
        { symbol: '\\sum_{i=1}^{n}', display: '∑ⁿᵢ₌₁', insert: '\\sum_{ = }^{ } ', cursorOffset: 2 },
        { symbol: '\\prod', display: '∏', insert: '\\prod ', cursorOffset: 0 },
        { symbol: '\\prod_{i=1}^{n}', display: '∏ⁿᵢ₌₁', insert: '\\prod_{ = }^{ } ', cursorOffset: 2 },
        { symbol: '\\frac{d}{dx}', display: 'd/dx', insert: '\\frac{d}{dx} ', cursorOffset: 0 },
        { symbol: '\\frac{\\partial}{\\partial x}', display: '∂/∂x', insert: '\\frac{\\partial}{\\partial } ', cursorOffset: 1 },
        { symbol: '\\nabla', display: '∇', insert: '\\nabla ', cursorOffset: 0 },
        { symbol: '\\Delta', display: 'Δ', insert: '\\Delta ', cursorOffset: 0 }
      ]
    },
    greek: {
      name: 'יוונית',
      symbols: [
        { symbol: '\\alpha', display: 'α', insert: '\\alpha', cursorOffset: 0 },
        { symbol: '\\beta', display: 'β', insert: '\\beta', cursorOffset: 0 },
        { symbol: '\\gamma', display: 'γ', insert: '\\gamma', cursorOffset: 0 },
        { symbol: '\\delta', display: 'δ', insert: '\\delta', cursorOffset: 0 },
        { symbol: '\\epsilon', display: 'ε', insert: '\\epsilon', cursorOffset: 0 },
        { symbol: '\\theta', display: 'θ', insert: '\\theta', cursorOffset: 0 },
        { symbol: '\\lambda', display: 'λ', insert: '\\lambda', cursorOffset: 0 },
        { symbol: '\\mu', display: 'μ', insert: '\\mu', cursorOffset: 0 },
        { symbol: '\\sigma', display: 'σ', insert: '\\sigma', cursorOffset: 0 },
        { symbol: '\\phi', display: 'φ', insert: '\\phi', cursorOffset: 0 },
        { symbol: '\\omega', display: 'ω', insert: '\\omega', cursorOffset: 0 },
        { symbol: '\\Gamma', display: 'Γ', insert: '\\Gamma', cursorOffset: 0 },
        { symbol: '\\Delta', display: 'Δ', insert: '\\Delta', cursorOffset: 0 },
        { symbol: '\\Theta', display: 'Θ', insert: '\\Theta', cursorOffset: 0 },
        { symbol: '\\Lambda', display: 'Λ', insert: '\\Lambda', cursorOffset: 0 },
        { symbol: '\\Omega', display: 'Ω', insert: '\\Omega', cursorOffset: 0 }
      ]
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertMathSymbol = (insertText, cursorOffset) => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBefore = message.substring(0, cursorPos);
    const textAfter = message.substring(cursorPos);
    const newMessage = textBefore + insertText + textAfter;
    setMessage(newMessage);

    // Calculate dynamic cursor position
    let newCursorPos = cursorPos + insertText.length;
    if (insertText.includes('{ }') || insertText.includes('( )') || insertText.includes('[ ]') || insertText.includes('{  }')) {
      // Place cursor inside the first empty braces/parentheses/brackets
      const match = insertText.match(/\{\s*\}|\(\s*\)|\[\s*\]/);
      if (match) {
        newCursorPos = cursorPos + insertText.indexOf(match[0]) + 1;
      }
    } else if (insertText.includes('\\frac{ }{ }') || insertText.includes('\\sqrt[ ]{ }') || insertText.includes('\\log_{ }( )')) {
      // Place cursor in the first placeholder for fractions, nth roots, or logs
      const match = insertText.match(/\{\s*\}/);
      if (match) {
        newCursorPos = cursorPos + insertText.indexOf(match[0]) + 1;
      }
    } else {
      newCursorPos -= cursorOffset;
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className={`border-t border-gray-200 p-4 bg-white ${isMathKeyboardOpen ? 'absolute bottom-0 w-96' : 'relative'}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !message.trim() || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'שלח'
            )}
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="שאל שאלה במתמטיקה..."
            className="flex-1 min-h-[40px] max-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            dir="rtl"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-start">
          <button
            type="button"
            onClick={onToggleMathKeyboard}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border text-gray-600"
          >
            🧮 {isMathKeyboardOpen ? 'סגור מקלדת מתמטית' : 'מקלדת מתמטית'}
          </button>
        </div>

        {isMathKeyboardOpen && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex gap-1 mb-3 overflow-x-auto">
              {Object.entries(mathCategories).map(([key, category]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                    activeCategory === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {mathCategories[activeCategory].symbols.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertMathSymbol(item.insert, item.cursorOffset)}
                  className="p-2 bg-white hover:bg-blue-50 hover:border-blue-300 rounded border text-sm font-mono transition-colors min-h-[40px] flex items-center justify-center"
                  title={item.symbol}
                >
                  <span className="text-lg">{item.display}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInput;