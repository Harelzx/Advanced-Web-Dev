import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

# Get the path to the service account key on the desktop
desktop_path = os.path.expanduser("~/Desktop")
service_account_path = os.path.join(desktop_path, "serviceAccountKey.json")

# Initialize Firebase Admin with your service account credentials
cred = credentials.Certificate(service_account_path)
try:
    firebase_admin.initialize_app(cred)
except ValueError:
    # App already initialized
    pass

# Get Firestore client
db = firestore.client()

# Medium difficulty questions
medium_questions = [
    # Algebra Questions (5)
    {
        "id": "algebra_m1",
        "subject": "algebra",
        "level": "medium",
        "text": "פתור את המשוואה: 2x² - 5x - 12 = 0",
        "correct_answer": "x = 4 או x = -1.5",
        "incorrect_answers": ["x = 3 או x = -2", "x = 4 או x = -2", "x = 3 או x = -1.5"],
        "explanation": "נשתמש בנוסחת השורשים: x = (-(-5) ± √((-5)² - 4(2)(-12))) / (2(2)) = (5 ± √(25 + 96)) / 4 = (5 ± √121) / 4 = (5 ± 11) / 4 = 4 או -1.5",
        "timeLimit": 60
    },
    {
        "id": "algebra_m2",
        "subject": "algebra",
        "level": "medium",
        "text": "מצא את x אם: log₂(x) + log₂(x+3) = 4",
        "correct_answer": "x = 5",
        "incorrect_answers": ["x = 4", "x = 6", "x = 3"],
        "explanation": "נשתמש בחוקי לוגריתמים: log₂(x(x+3)) = 4, לכן x(x+3) = 2⁴ = 16, x² + 3x - 16 = 0, (x + 4)(x - 1) = 0, x = 5",
        "timeLimit": 60
    },
    {
        "id": "algebra_m3",
        "subject": "algebra",
        "level": "medium",
        "text": "פתור את המשוואה: |2x - 1| = |x + 2|",
        "correct_answer": "x = 1",
        "incorrect_answers": ["x = -1", "x = 2", "x = 0"],
        "explanation": "נבדוק את כל המקרים האפשריים של ערך מוחלט. כאשר x = 1, שני הצדדים שווים ל-3",
        "timeLimit": 60
    },
    {
        "id": "algebra_m4",
        "subject": "algebra",
        "level": "medium",
        "text": "מצא את x: (x-2)/(x+1) = 3",
        "correct_answer": "x = 7",
        "incorrect_answers": ["x = 5", "x = 6", "x = 8"],
        "explanation": "נכפול את שני הצדדים ב-(x+1): x-2 = 3(x+1), x-2 = 3x+3, -2x = 5, x = 7",
        "timeLimit": 60
    },
    {
        "id": "algebra_m5",
        "subject": "algebra",
        "level": "medium",
        "text": "פתור את המשוואה: √(x+4) + √x = 6",
        "correct_answer": "x = 9",
        "incorrect_answers": ["x = 8", "x = 10", "x = 7"],
        "explanation": "נעביר אגף: √(x+4) = 6 - √x, נעלה בריבוע: x+4 = 36 - 12√x + x, 4 = 36 - 12√x, -32 = -12√x, √x = 8/3, x = 9",
        "timeLimit": 60
    },

    # Geometry Questions (5)
    {
        "id": "geometry_m1",
        "subject": "geometry",
        "level": "medium",
        "text": "במשולש ישר זווית, היתר הוא 13 ס\"מ ואחד הניצבים הוא 5 ס\"מ. מה אורך הניצב השני?",
        "correct_answer": "12 ס\"מ",
        "incorrect_answers": ["11 ס\"מ", "10 ס\"מ", "13 ס\"מ"],
        "explanation": "לפי משפט פיתגורס: 5² + x² = 13², 25 + x² = 169, x² = 144, x = 12",
        "timeLimit": 60
    },
    {
        "id": "geometry_m2",
        "subject": "geometry",
        "level": "medium",
        "text": "מה שטח הטרפז שבסיסיו 8 ס\"מ ו-12 ס\"מ וגובהו 5 ס\"מ?",
        "correct_answer": "50 סמ\"ר",
        "incorrect_answers": ["40 סמ\"ר", "45 סמ\"ר", "55 סמ\"ר"],
        "explanation": "שטח טרפז = ((a+b)×h)/2 = ((8+12)×5)/2 = 20×5/2 = 50",
        "timeLimit": 60
    },
    {
        "id": "geometry_m3",
        "subject": "geometry",
        "level": "medium",
        "text": "במעגל שרדיוסו 5 ס\"מ, מה אורך המיתר שמרחקו מהמרכז 3 ס\"מ?",
        "correct_answer": "8 ס\"מ",
        "incorrect_answers": ["7 ס\"מ", "9 ס\"מ", "6 ס\"מ"],
        "explanation": "נשתמש במשפט פיתגורס: 5² = 3² + (x/2)², 25 = 9 + x²/4, x²/4 = 16, x = 8",
        "timeLimit": 60
    },
    {
        "id": "geometry_m4",
        "subject": "geometry",
        "level": "medium",
        "text": "מה היקף מעוין שאורך צלעו 10 ס\"מ ואחת מזוויותיו 60°?",
        "correct_answer": "40 ס\"מ",
        "incorrect_answers": ["30 ס\"מ", "35 ס\"מ", "45 ס\"מ"],
        "explanation": "היקף מעוין = 4 × צלע = 4 × 10 = 40 ס\"מ",
        "timeLimit": 60
    },
    {
        "id": "geometry_m5",
        "subject": "geometry",
        "level": "medium",
        "text": "מה שטח משושה משוכלל שאורך צלעו 4 ס\"מ?",
        "correct_answer": "41.6 סמ\"ר",
        "incorrect_answers": ["38.4 סמ\"ר", "40.2 סמ\"ר", "43.8 סמ\"ר"],
        "explanation": "שטח משושה משוכלל = (3×√3×a²)/2, כאשר a הוא אורך הצלע. התוצאה היא בקירוב 41.6",
        "timeLimit": 60
    },

    # Trigonometry Questions (5)
    {
        "id": "trigonometry_m1",
        "subject": "trigonometry",
        "level": "medium",
        "text": "חשב את sin(x) אם cos(x) = 0.6 ו-x ברביע הראשון",
        "correct_answer": "0.8",
        "incorrect_answers": ["0.6", "0.7", "0.9"],
        "explanation": "לפי הזהות sin²(x) + cos²(x) = 1, נקבל sin(x) = √(1-0.6²) = 0.8",
        "timeLimit": 60
    },
    {
        "id": "trigonometry_m2",
        "subject": "trigonometry",
        "level": "medium",
        "text": "מצא את tan(15°)",
        "correct_answer": "0.268",
        "incorrect_answers": ["0.25", "0.289", "0.3"],
        "explanation": "tan(15°) = sin(15°)/cos(15°) ≈ 0.268",
        "timeLimit": 60
    },
    {
        "id": "trigonometry_m3",
        "subject": "trigonometry",
        "level": "medium",
        "text": "פתור את המשוואה: sin(2x) = sin(x)",
        "correct_answer": "x = 0",
        "incorrect_answers": ["x = π/2", "x = π", "x = π/4"],
        "explanation": "sin(2x) = 2sin(x)cos(x), לכן 2sin(x)cos(x) = sin(x), sin(x)(2cos(x) - 1) = 0, x = 0",
        "timeLimit": 60
    },
    {
        "id": "trigonometry_m4",
        "subject": "trigonometry",
        "level": "medium",
        "text": "חשב את cos(75°)",
        "correct_answer": "0.259",
        "incorrect_answers": ["0.3", "0.224", "0.276"],
        "explanation": "cos(75°) = cos(45° + 30°) = cos(45°)cos(30°) - sin(45°)sin(30°) ≈ 0.259",
        "timeLimit": 60
    },
    {
        "id": "trigonometry_m5",
        "subject": "trigonometry",
        "level": "medium",
        "text": "מצא את הזווית x אם sin(x) = 0.5 ו-cos(x) < 0",
        "correct_answer": "150°",
        "incorrect_answers": ["30°", "210°", "330°"],
        "explanation": "אם sin(x) = 0.5 וcos(x) < 0, אז x נמצא ברביע השני או השלישי. מכיוון שsin(x) חיובי, x = 150°",
        "timeLimit": 60
    },

    # Statistics Questions (5)
    {
        "id": "statistics_m1",
        "subject": "statistics",
        "level": "medium",
        "text": "בכיתה של 30 תלמידים, הציון הממוצע הוא 85. אם מוסיפים תלמיד שקיבל 95, מה יהיה הממוצע החדש?",
        "correct_answer": "85.32",
        "incorrect_answers": ["85.5", "86", "85.25"],
        "explanation": "ממוצע חדש = (30×85 + 95)/31 = (2550 + 95)/31 = 2645/31 = 85.32",
        "timeLimit": 60
    },
    {
        "id": "statistics_m2",
        "subject": "statistics",
        "level": "medium",
        "text": "מהי סטיית התקן של המספרים: 2, 4, 4, 6, 6, 6, 8, 8, 10?",
        "correct_answer": "2.28",
        "incorrect_answers": ["2", "2.5", "2.15"],
        "explanation": "נחשב את הממוצע (6), נחשב את סכום ריבועי הסטיות מהממוצע ונחלק במספר האיברים פחות 1, ולבסוף נוציא שורש",
        "timeLimit": 60
    },
    {
        "id": "statistics_m3",
        "subject": "statistics",
        "level": "medium",
        "text": "בהטלת קוביה הוגנת 600 פעמים, כמה פעמים בערך צפוי להתקבל המספר 6?",
        "correct_answer": "100",
        "incorrect_answers": ["120", "90", "150"],
        "explanation": "ההסתברות לקבלת 6 היא 1/6, לכן בהטלת הקוביה 600 פעמים צפוי להתקבל 6 כ-100 פעמים",
        "timeLimit": 60
    },
    {
        "id": "statistics_m4",
        "subject": "statistics",
        "level": "medium",
        "text": "מהו החציון של הסדרה: 3, 5, 5, 7, 7, 7, 8, 8, 9, 12?",
        "correct_answer": "7",
        "incorrect_answers": ["7.5", "8", "6.5"],
        "explanation": "בסדרה של 10 איברים, החציון הוא ממוצע של האיבר החמישי והשישי. שניהם 7, לכן החציון הוא 7",
        "timeLimit": 60
    },
    {
        "id": "statistics_m5",
        "subject": "statistics",
        "level": "medium",
        "text": "מהי ההסתברות להוציא מספר זוגי בהטלת קוביה ומספר זוגי בהטלת קוביה נוספת?",
        "correct_answer": "0.25",
        "incorrect_answers": ["0.3", "0.2", "0.33"],
        "explanation": "ההסתברות למספר זוגי בקוביה היא 0.5, ההסתברות לשני מאורעות בלתי תלויים היא מכפלת ההסתברויות: 0.5 × 0.5 = 0.25",
        "timeLimit": 60
    },

    # Calculus Questions (5)
    {
        "id": "calculus_m1",
        "subject": "calculus",
        "level": "medium",
        "text": "מצא את הנגזרת של f(x) = x³sin(x)",
        "correct_answer": "3x²sin(x) + x³cos(x)",
        "incorrect_answers": ["3x²sin(x)", "x³cos(x)", "3x²sin(x) - x³cos(x)"],
        "explanation": "נשתמש בכלל המכפלה: f'(x) = (x³)'sin(x) + x³(sin(x))'",
        "timeLimit": 60
    },
    {
        "id": "calculus_m2",
        "subject": "calculus",
        "level": "medium",
        "text": "חשב את האינטגרל ∫(2x + 3)dx בין 0 ל-2",
        "correct_answer": "8",
        "incorrect_answers": ["7", "9", "10"],
        "explanation": "∫(2x + 3)dx = x² + 3x + C, [x² + 3x]₀² = (4 + 6) - (0 + 0) = 8",
        "timeLimit": 60
    },
    {
        "id": "calculus_m3",
        "subject": "calculus",
        "level": "medium",
        "text": "מצא את נקודות הקיצון של f(x) = x³ - 3x² - 9x + 1",
        "correct_answer": "x = -1 ו-x = 3",
        "incorrect_answers": ["x = 0 ו-x = 3", "x = -1 ו-x = 2", "x = 0 ו-x = 2"],
        "explanation": "f'(x) = 3x² - 6x - 9 = 3(x² - 2x - 3) = 3(x + 1)(x - 3)",
        "timeLimit": 60
    },
    {
        "id": "calculus_m4",
        "subject": "calculus",
        "level": "medium",
        "text": "מצא את הנגזרת של f(x) = ln(x²+1)",
        "correct_answer": "2x/(x²+1)",
        "incorrect_answers": ["2x", "1/(x²+1)", "2/(x²+1)"],
        "explanation": "נשתמש בכלל השרשרת: f'(x) = (1/(x²+1))(2x)",
        "timeLimit": 60
    },
    {
        "id": "calculus_m5",
        "subject": "calculus",
        "level": "medium",
        "text": "חשב את הגבול: lim(x→∞) (x²+2x)/(x²+1)",
        "correct_answer": "1",
        "incorrect_answers": ["0", "∞", "2"],
        "explanation": "נחלק מונה ומכנה ב-x², נקבל (1+2/x)/(1+1/x²) כאשר x→∞ התוצאה היא 1",
        "timeLimit": 60
    }
]

def upload_questions():
    """Upload questions to Firestore."""
    print("Starting to upload medium difficulty questions...")
    
    # Reference to the questions collection
    questions_ref = db.collection('questions')
    
    # Upload each question
    for question in medium_questions:
        try:
            # Add the question to Firestore
            doc_ref = questions_ref.add(question)
            print(f"Successfully added question {question['id']} with document ID: {doc_ref[1].id}")
        except Exception as e:
            print(f"Error adding question {question['id']}: {e}")
    
    print("Finished uploading medium difficulty questions")

if __name__ == "__main__":
    upload_questions() 