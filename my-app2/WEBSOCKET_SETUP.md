# הגדרת WebSocket Server

## אחרי פריסה על Render

1. **קבל את ה-URL מ-Render** - אתה תקבל URL כמו:
   ```
   https://websocket-chat-server-xxxx.onrender.com
   ```

2. **צור קובץ `.env.local`** בתיקיית הפרויקט הראשי:
   ```bash
   # WebSocket Server URL
   NEXT_PUBLIC_WS_URL=wss://websocket-chat-server-xxxx.onrender.com
   ```

   **חשוב:** השתמש ב-`wss://` (לא `ws://`) עבור HTTPS של Render!

3. **לפיתוח מקומי**, השתמש ב:
   ```bash
   NEXT_PUBLIC_WS_URL=ws://localhost:8080
   ```

## בדיקה

1. **הפעל את השרת מקומית** (לבדיקה):
   ```bash
   cd websocket-server
   npm start
   ```

2. **פתח את `websocket-server/test-client.html`** בדפדפן לבדיקה

## פתרון בעיות

- אם הצ'אט לא עובד, בדוק שמשתנה הסביבה מוגדר נכון
- ודא שהשרת על Render פועל (לא נמצא במצב "sleep")
- בדוק ב-Console של הדפדפן אם יש שגיאות חיבור 