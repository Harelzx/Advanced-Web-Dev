// utils/mathTextAnalyzer.js
// כלי עזר מתקדם לניתוח טקסט מתמטי

// מילון מורחב לזיהוי מונחים מתמטיים
export const mathTermsDictionary = {
  // אלגברה
  algebra: {
    hebrew: ['משוואה', 'משוואות', 'ביטוי', 'ביטויים', 'פתרון', 'פתרונות', 'משתנה', 'משתנים', 'קבוע', 'קבועים', 'מקדם', 'מקדמים'],
    english: ['equation', 'expression', 'variable', 'constant', 'coefficient', 'solution', 'solve'],
    symbols: ['x', 'y', 'z', 'a', 'b', 'c', '=', '+', '-', '*', '/', '^']
  },
  
  // גיאומטריה
  geometry: {
    hebrew: ['משולש', 'משולשים', 'ריבוע', 'ריבועים', 'מעגל', 'מעגלים', 'זווית', 'זוויות', 'שטח', 'היקף', 'נפח', 'גובה', 'רוחב', 'אורך'],
    english: ['triangle', 'square', 'circle', 'angle', 'area', 'perimeter', 'volume', 'height', 'width', 'length'],
    symbols: ['°', '∠', '△', '□', '○', '⊥', '∥']
  },
  
  // חדוא
  calculus: {
    hebrew: ['נגזרת', 'נגזרות', 'אינטגרל', 'אינטגרלים', 'גבול', 'גבולות', 'רציפות', 'קצב', 'שינוי', 'גדילה'],
    english: ['derivative', 'integral', 'limit', 'continuous', 'rate', 'change', 'growth'],
    symbols: ['∫', '∑', '∏', '∂', '∇', '→', '∞', 'dx', 'dy']
  },
  
  // טריגונומטריה
  trigonometry: {
    hebrew: ['סינוס', 'קוסינוס', 'טנגנס', 'קוטנגנס', 'רדיאן', 'רדיאנים', 'מעלה', 'מעלות'],
    english: ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'radian', 'degree'],
    symbols: ['sin', 'cos', 'tan', 'cot', 'π', '°']
  },
  
  // הסתברות וסטטיסטיקה
  statistics: {
    hebrew: ['הסתברות', 'הסתברויות', 'ממוצע', 'חציון', 'שכיח', 'סטיית תקן', 'התפלגות', 'מדגם', 'אוכלוסיה'],
    english: ['probability', 'average', 'mean', 'median', 'mode', 'standard deviation', 'distribution', 'sample', 'population'],
    symbols: ['P', 'μ', 'σ', 'x̄', '!', 'C', 'nCr', 'nPr']
  }
};

// זיהוי דפוסי שגיאות נפוצות
export const commonMistakePatterns = {
  // שגיאות בכתיב של פונקציות
  trigFunctions: [
    { wrong: /סי[נו]ס/gi, correct: 'sin', type: 'trigonometry' },
    { wrong: /קו[סז]ינוס/gi, correct: 'cos', type: 'trigonometry' },
    { wrong: /טנג[עס]/gi, correct: 'tan', type: 'trigonometry' },
    { wrong: /טנגנ[סת]/gi, correct: 'tan', type: 'trigonometry' }
  ],
  
  // שגיאות באותיות יווניות
  greekLetters: [
    { wrong: /דלת[הא]/gi, correct: 'Δ', type: 'symbol' },
    { wrong: /אלפ[הא]/gi, correct: 'α', type: 'symbol' },
    { wrong: /בט[הא]/gi, correct: 'β', type: 'symbol' },
    { wrong: /פא[יי]/gi, correct: 'π', type: 'symbol' }
  ],
  
  // שגיאות במונחים מתמטיים
  mathTerms: [
    { wrong: /פונק[צס]י[הא]/gi, correct: 'פונקציה', type: 'terminology' },
    { wrong: /משוו[הא][הת]/gi, correct: 'משוואה', type: 'terminology' },
    { wrong: /נגזר[תה]/gi, correct: 'נגזרת', type: 'terminology' }
  ]
};

// פונקציה מתקדמת לזיהוי הקשר מתמטי
export function detectAdvancedMathContext(text) {
  const normalizedText = text.toLowerCase().replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, ' ');
  const contexts = [];
  
  Object.entries(mathTermsDictionary).forEach(([category, terms]) => {
    let score = 0;
    const foundTerms = [];
    
    // בדיקת מונחים בעברית
    terms.hebrew.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches) {
        score += matches.length * 2; // משקל כפול למונחים בעברית
        foundTerms.push(...matches);
      }
    });
    
    // בדיקת מונחים באנגלית
    terms.english.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches) {
        score += matches.length;
        foundTerms.push(...matches);
      }
    });
    
    // בדיקת סמלים
    terms.symbols.forEach(symbol => {
      if (text.includes(symbol)) {
        score += 1;
        foundTerms.push(symbol);
      }
    });
    
    if (score > 0) {
      contexts.push({
        category,
        score,
        confidence: Math.min(score / 5, 1), // נורמליזציה של הביטחון
        foundTerms: [...new Set(foundTerms)] // הסרת כפילויות
      });
    }
  });
  
  return contexts.sort((a, b) => b.score - a.score);
}

// פונקציה לתיקון שגיאות הקלדה מתקדמת
export function advancedTypoCorrection(text) {
  let correctedText = text;
  const corrections = [];
  
  Object.values(commonMistakePatterns).forEach(patternGroup => {
    patternGroup.forEach(({ wrong, correct, type }) => {
      const matches = correctedText.match(wrong);
      if (matches) {
        matches.forEach(match => {
          corrections.push({
            original: match,
            corrected: correct,
            type,
            position: correctedText.indexOf(match)
          });
        });
        correctedText = correctedText.replace(wrong, correct);
      }
    });
  });
  
  return {
    correctedText,
    corrections,
    hasCorrections: corrections.length > 0
  };
}

// זיהוי רמת מורכבות מתקדמת
export function detectComplexity(text) {
  const complexityIndicators = {
    basic: {
      keywords: ['חשב', 'מהו', 'כמה', 'פשוט', 'בסיסי'],
      operations: ['+', '-', '×', '÷', '='],
      weight: 1
    },
    intermediate: {
      keywords: ['פתור', 'מצא', 'הוכח', 'שרטט', 'חקור'],
      operations: ['^', '√', 'sin', 'cos', 'tan', 'log'],
      weight: 2
    },
    advanced: {
      keywords: ['נתח', 'הסבר', 'השווה', 'דון', 'חקור לעומק'],
      operations: ['∫', '∑', '∏', '∂', '∇', 'lim'],
      weight: 3
    }
  };
  
  let totalScore = 0;
  let maxWeight = 0;
  const details = {};
  
  Object.entries(complexityIndicators).forEach(([level, indicators]) => {
    let levelScore = 0;
    
    // בדיקת מילות מפתח
    indicators.keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        levelScore += indicators.weight;
      }
    });
    
    // בדיקת פעולות מתמטיות
    indicators.operations.forEach(operation => {
      if (text.includes(operation)) {
        levelScore += indicators.weight;
      }
    });
    
    details[level] = levelScore;
    totalScore += levelScore;
    
    if (levelScore > 0 && indicators.weight > maxWeight) {
      maxWeight = indicators.weight;
    }
  });
  
  // קביעת רמת המורכבות על בסיס הציון הגבוה ביותר
  let complexity = 'basic';
  if (maxWeight === 3) complexity = 'advanced';
  else if (maxWeight === 2) complexity = 'intermediate';
  
  return {
    level: complexity,
    confidence: maxWeight / 3,
    details,
    totalScore
  };
}

// זיהוי סוג שאלה
export function detectQuestionType(text) {
  const questionTypes = {
    calculation: {
      patterns: [/חשב/, /כמה/, /מהו הערך/, /מצא את הערך/],
      keywords: ['חשב', 'כמה', 'ערך', 'תשובה']
    },
    proof: {
      patterns: [/הוכח/, /הראה כי/, /הסבר מדוע/, /נמק/],
      keywords: ['הוכח', 'הראה', 'הסבר', 'נמק', 'מדוע']
    },
    graph: {
      patterns: [/שרטט/, /צייר/, /גרף/, /הצג גרפית/],
      keywords: ['שרטט', 'צייר', 'גרף', 'ציור', 'הצגה']
    },
    solve: {
      patterns: [/פתור/, /מצא/, /קבע/, /חשב את/],
      keywords: ['פתור', 'מצא', 'קבע', 'פתרון']
    },
    explain: {
      patterns: [/הסבר/, /מה המשמעות/, /מה זה/, /תאר/],
      keywords: ['הסבר', 'משמעות', 'מה זה', 'תאר', 'הגדר']
    }
  };
  
  const detectedTypes = [];
  
  Object.entries(questionTypes).forEach(([type, config]) => {
    let score = 0;
    
    // בדיקת דפוסים
    config.patterns.forEach(pattern => {
      if (pattern.test(text)) {
        score += 3;
      }
    });
    
    // בדיקת מילות מפתח
    config.keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        score += 1;
      }
    });
    
    if (score > 0) {
      detectedTypes.push({
        type,
        score,
        confidence: Math.min(score / 5, 1)
      });
    }
  });
  
  return detectedTypes.sort((a, b) => b.score - a.score);
}

// פונקציה מאוחדת לניתוח טקסט מקיף
export function comprehensiveMathAnalysis(text) {
  const typoAnalysis = advancedTypoCorrection(text);
  const contextAnalysis = detectAdvancedMathContext(typoAnalysis.correctedText);
  const complexityAnalysis = detectComplexity(typoAnalysis.correctedText);
  const questionTypeAnalysis = detectQuestionType(typoAnalysis.correctedText);
  
  return {
    original: text,
    corrected: typoAnalysis.correctedText,
    corrections: typoAnalysis.corrections,
    contexts: contextAnalysis,
    complexity: complexityAnalysis,
    questionTypes: questionTypeAnalysis,
    primaryContext: contextAnalysis[0]?.category || 'general',
    primaryQuestionType: questionTypeAnalysis[0]?.type || 'general',
    processingTimestamp: new Date().toISOString()
  };
}