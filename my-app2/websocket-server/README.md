# WebSocket Chat Server

WebSocket server for real-time communication between teachers and parents.

## Architecture

- **WebSocket**: Real-time communication
- **Firebase Firestore**: Message history storage
- **Hybrid approach**: Combines real-time messaging with persistent storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase Admin credentials:
```bash
# Set the Google Application Credentials environment variable
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

3. Start the server:
```bash
npm start
```

## Message Format

```json
{
  "text": "Hello!",
  "sender": "teacher", // or "parent"
  "teacherId": "teacher_uid",
  "parentId": "parent_uid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Firebase Structure

```
/chats/{teacherId}_{parentId}/messages/{messageId}
{
  "text": "Message content",
  "sender": "teacher|parent",
  "timestamp": serverTimestamp(),
  "teacherId": "...",
  "parentId": "..."
}
```

## Usage

Connect to `ws://localhost:8080` from your React client. 