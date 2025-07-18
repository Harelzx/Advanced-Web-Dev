# WebSocket Chat Server

## תיאור
שרת WebSocket פשוט לצ'אט בזמן אמת בין מורים להורים. השרת מטפל בתקשורת בזמן אמת בלבד, ואילו השמירה ל-Firebase מתבצעת בצד הקליינט.

## מאפיינים
- תקשורת WebSocket בזמן אמת
- שידור הודעות לכל הלקוחות המחוברים
- מעקב אחר לקוחות מחוברים
- סגירה נקייה של השרת

## התקנה והפעלה

### התקנת תלויות
```bash
npm install
```

### הפעלת השרת
```bash
npm start
```

השרת יתחיל על פורט 8080.

## כיצד זה עובד

1. **חיבור לקוח**: כל לקוח שמתחבר מקבל ID ייחודי
2. **הודעות מידע משתמש**: הלקוח יכול לשלוח מידע על עצמו (role, userId)
3. **שידור הודעות**: הודעות נשלחות לכל הלקוחות המחוברים
4. **השמירה**: מתבצעת בצד הקליינט (Next.js) ל-Firebase

## הודעות נתמכות

### הודעת מידע משתמש
```json
{
  "type": "user_info",
  "userId": "teacher-123",
  "role": "teacher"
}
```

### הודעת צ'אט
```json
{
  "type": "chat",
  "text": "הודעה לדוגמה",
  "sender": "teacher",
  "teacherId": "teacher-123",
  "parentId": "parent-456"
}
```