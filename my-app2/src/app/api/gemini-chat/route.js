import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { db, GEMINI_API_KEY } from '../../firebase/config';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// מילון לתיקון שגיאות הקלדה נפוצות במתמטיקה
const mathTypoCorrections = {
  // פונקציות טריגונומטריות
  'סינוס': 'sin',
  'קוסינוס': 'cos',
  'טנגס': 'tan',
  'טנגנס': 'tan',
  'קוטנגס': 'cot',
  'סין': 'sin',
  'קוס': 'cos',
  'טנג': 'tan',
  
  // מונחים מתמטיים
  'נגזרת': 'derivative',
  'אינטגרל': 'integral',
  'פונקציה': 'function',
  'משוואה': 'equation',
  'פתרון': 'solution',
  'גרף': 'graph',
  'פרבולה': 'parabola',
  'היפרבולה': 'hyperbola',
  'אליפסה': 'ellipse',
  'משולש': 'triangle',
  'ריבוע': 'square',
  'מעגל': 'circle',
  'זווית': 'angle',
  'קטע': 'segment',
  'ישר': 'line',
  'מקביל': 'parallel',
  'מאונך': 'perpendicular',
  
  // שגיאות נפוצות
  'תרגיל': 'תרגיל',
  'חישוב': 'חישוב',
  'בעיה': 'בעיה',
  'שאלה': 'שאלה',
  'תשובה': 'תשובה',
  'פתירה': 'פתרון',
  'חלוקה': 'חילוק',
  'כפל': 'כפל',
  'חיבור': 'חיבור',
  'חיסור': 'חיסור',
  'חזקה': 'חזקה',
  'שורש': 'שורש',
  'לוגריתם': 'לוגריתם',
  'לוג': 'log',
  'אל אן': 'ln',
  'פאי': 'π',
  'אינסוף': '∞'
};

// זיהוי קיצורים ומונחים לא פורמליים
const informalTerms = {
  'דלתא': 'Δ',
  'אלפא': 'α',
  'בטא': 'β',
  'גמא': 'γ',
  'תטא': 'θ',
  'לבדא': 'λ',
  'מיו': 'μ',
  'סיגמא': 'σ',
  'פי': 'φ',
  'אומגה': 'ω',
  'איקס': 'x',
  'וואי': 'y',
  'זד': 'z',
  'אף': 'f',
  'ג׳י': 'g',
  'איי': 'i',
  'ג׳יי': 'j',
  'קיי': 'k',
  'אל': 'l',
  'אם': 'm',
  'אן': 'n'
};

// זיהוי רמת קושי מילות מפתח
const difficultyKeywords = {
  basic: ['חיבור', 'חיסור', 'כפל', 'חילוק', 'פשוט', 'קל', 'בסיסי', 'חשב', 'מהו'],
  intermediate: ['משוואה', 'פונקציה', 'גרף', 'נגזרת', 'שורש', 'חזקה', 'טריגונומטריה', 'גיאומטריה'],
  advanced: ['אינטגרל', 'גבול', 'רציפות', 'התכנסות', 'טור', 'מטריצה', 'וקטור', 'משפט', 'הוכחה', 'אנליזה']
};

// זיהוי מילות מפתח שמצריכות פתרון שלבי
const stepBasedKeywords = [
  'פתור', 'פתרון', 'חשב', 'מצא', 'קבע', 'הוכח', 'בדוק', 'פשט', 'גזור', 
  'אינטגרל', 'שלבים', 'איך', 'כיצד', 'תרגיל', 'משוואה', 'בעיה'
];

// פונקציה לתיקון טקסט
function correctTypos(text) {
  let correctedText = text;
  
  // תיקון שגיאות הקלדה
  Object.entries(mathTypoCorrections).forEach(([typo, correction]) => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    correctedText = correctedText.replace(regex, correction);
  });
  
  // החלפת מונחים לא פורמליים
  Object.entries(informalTerms).forEach(([informal, formal]) => {
    const regex = new RegExp(`\\b${informal}\\b`, 'gi');
    correctedText = correctedText.replace(regex, formal);
  });
  
  return correctedText;
}

// פונקציה לזיהוי רמת קושי
function detectDifficulty(text) {
  const lowerText = text.toLowerCase();
  let basicScore = 0;
  let intermediateScore = 0;
  let advancedScore = 0;
  
  difficultyKeywords.basic.forEach(keyword => {
    if (lowerText.includes(keyword)) basicScore++;
  });
  
  difficultyKeywords.intermediate.forEach(keyword => {
    if (lowerText.includes(keyword)) intermediateScore++;
  });
  
  difficultyKeywords.advanced.forEach(keyword => {
    if (lowerText.includes(keyword)) advancedScore++;
  });
  
  if (advancedScore > 0) return 'advanced';
  if (intermediateScore > 0) return 'intermediate';
  return 'basic';
}

// פונקציה לזיהוי צורך בפתרון שלבי
function requiresStepByStep(text) {
  const lowerText = text.toLowerCase();
  return stepBasedKeywords.some(keyword => lowerText.includes(keyword));
}

// פונקציה לזיהוי הקשר מתמטי
function detectMathContext(text) {
  const contexts = {
    algebra: ['משוואה', 'x', 'y', 'פתרון', 'משתנה', 'ביטוי'],
    geometry: ['משולש', 'ריבוע', 'מעגל', 'זווית', 'שטח', 'היקף', 'נפח'],
    calculus: ['נגזרת', 'אינטגרל', 'גבול', 'רציפות', 'קצב שינוי'],
    trigonometry: ['sin', 'cos', 'tan', 'סינוס', 'קוסינוס', 'טנגנס', 'זווית'],
    statistics: ['הסתברות', 'ממוצע', 'חציון', 'סטיית תקן', 'התפלגות'],
    functions: ['פונקציה', 'גרף', 'תחום', 'טווח', 'f(x)', 'g(x)']
  };
  
  const detectedContexts = [];
  const lowerText = text.toLowerCase();
  
  Object.entries(contexts).forEach(([context, keywords]) => {
    const matches = keywords.filter(keyword => lowerText.includes(keyword));
    if (matches.length > 0) {
      detectedContexts.push({
        context,
        confidence: matches.length / keywords.length,
        matchedKeywords: matches
      });
    }
  });
  
  return detectedContexts.sort((a, b) => b.confidence - a.confidence);
}

// פונקציה לקבלת הקשר קודם - פשוטה יותר
async function getRecentHistory(userId, maxResults = 3) {
  try {
    // פשוט query ללא index מורכב
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.type === 'math_tutor') { // סינון בצד הקליינט
        history.push({
          userMessage: data.userMessage,
          botResponse: data.botResponse,
          timestamp: data.timestamp
        });
      }
    });
    
    // מיון בצד הקליינט
    return history
      .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
      .slice(0, maxResults)
      .reverse(); // החזר בסדר כרונולוגי
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

export async function POST(request) {
  try {
    const { message, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'חסרים פרמטרי חובה' },
        { status: 400 }
      );
    }

    // שלב 1: תיקון שגיאות הקלדה והכרת מונחים לא פורמליים
    const correctedMessage = correctTypos(message);
    
    // שלב 2: זיהוי רמת קושי
    const difficulty = detectDifficulty(correctedMessage);
    
    // שלב 3: זיהוי הקשר מתמטי
    const mathContexts = detectMathContext(correctedMessage);
    
    // שלב 4: זיהוי צורך בפתרון שלבי
    const needsSteps = requiresStepByStep(correctedMessage);
    
    // שלב 5: קבלת היסטוריה קצרה
    const recentHistory = await getRecentHistory(userId, 3);

    // קביעת מספר טוקנים בהתאם לצורך
    const maxTokens = needsSteps ? 550 : 400;

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: maxTokens, 
        temperature: 0.3, // הפחתה לתשובות יותר עקביות
      }
    });

    // יצירת הקשר מוקדם מההיסטוריה
    let historyContext = '';
    if (recentHistory.length > 0) {
      historyContext = `
**הקשר קודם (${recentHistory.length} הודעות אחרונות):**
${recentHistory.map(h => `תלמיד: ${h.userMessage}\nמורה: ${h.botResponse.substring(0, 100)}...`).join('\n\n')}
---`;
    }

    // Create enhanced specialized prompt
const enhancedMathPrompt = `
You are an expert mathematics teacher specializing in 3-unit mathematics according to the Israeli curriculum (Bagrut level).

${historyContext}

**ANALYSIS OF CURRENT QUESTION:**
- **Original message:** "${message}"
- **Corrected message:** "${correctedMessage}"
- **Detected difficulty:** ${difficulty}
- **Requires step-by-step solution:** ${needsSteps ? 'YES' : 'NO'}
- **Math contexts detected:** ${mathContexts.map(c => `${c.context} (${Math.round(c.confidence * 100)}%)`).join(', ') || 'general'}
- **Matched keywords:** ${mathContexts.flatMap(c => c.matchedKeywords).join(', ') || 'none'}

**CRITICAL FORMATTING RULES FOR STEP-BY-STEP SOLUTIONS:**
${needsSteps ? `
🔴 **MANDATORY STEP FORMATTING:**
1. Each step MUST start on a NEW LINE
2. Each step MUST be numbered (1., 2., 3., etc.)
3. Use double line breaks between steps for better readability
4. Format example:
   שלב 1: [הסבר השלב הראשון]
   
   שלב 2: [הסבר השלב השני]
   
   שלב 3: [הסבר השלב השלישי]
   
   תשובה סופית: [התוצאה]

5. Never use bullet points (•) for steps - ONLY numbered steps
6. Always include "שלב" before the number for Hebrew clarity
7. Separate mathematical calculations from explanations with line breaks
` : ''}

**RESPONSE GUIDELINES:**
1. **Language:** Hebrew ONLY (except mathematical formulas)
2. **Acknowledge corrections:** If typos were corrected, briefly mention: "הבנתי שכוונתך ל[corrected term]"
3. **Context awareness:** Reference previous conversation if relevant
4. **Difficulty adaptation:**
   - **Basic:** Simple, direct explanations
   - **Intermediate:** Step-by-step with some theory
   - **Advanced:** Detailed analysis with connections to broader concepts
5. **Math context focus:** Emphasize the detected mathematical area
6. **Format:** ${needsSteps ? 'Use NUMBERED STEPS with proper line breaks as specified above' : 'Use structured format only when needed, direct answers for simple questions'}

**Current student question:** ${correctedMessage}

${needsSteps ? 'Provide a detailed step-by-step solution following the mandatory formatting rules above.' : 'Provide appropriate response considering the analysis above.'} If the original message had typos, acknowledge them naturally. Reference previous context if it helps understanding.
`;

    // Generate response
    const result = await model.generateContent(enhancedMathPrompt);
    const response = await result.response;
    let botResponse = response.text();

    // הוספת מידע על תיקונים אם נדרש
    let corrections = [];
    Object.entries(mathTypoCorrections).forEach(([typo, correction]) => {
      if (message.toLowerCase().includes(typo.toLowerCase()) && 
          !correctedMessage.toLowerCase().includes(typo.toLowerCase())) {
        corrections.push(`${typo} → ${correction}`);
      }
    });

    // Save enhanced conversation to Firestore
    const chatRef = collection(db, 'chats');
    await addDoc(chatRef, {
      userId: userId,
      userMessage: message,
      correctedMessage: correctedMessage,
      botResponse: botResponse,
      difficulty: difficulty,
      mathContexts: mathContexts,
      needsSteps: needsSteps,
      corrections: corrections,
      timestamp: serverTimestamp(),
      type: 'math_tutor'
    });

    return NextResponse.json({
      success: true,
      response: botResponse,
      metadata: {
        originalMessage: message,
        correctedMessage: correctedMessage,
        difficulty: difficulty,
        mathContexts: mathContexts,
        needsSteps: needsSteps,
        corrections: corrections,
        tokensUsed: maxTokens
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced Math Tutor Error:', error);
    
    return NextResponse.json(
      {
        error: 'שגיאה בעיבוד הבקשה',
        details: process.env.NODE_ENV === 'development' ? error.message : 'בדוק את מפתח ה-API'
      },
      { status: 500 }
    );
  }
}