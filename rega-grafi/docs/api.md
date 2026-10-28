# תיעוד ה-API של "רגע גרפי"

המסמך מיועד למי שכותב את ה-React. לכל endpoint יש: מה לשלוח, מה חוזר, ואילו שגיאות אפשריות.

## 1. כללים כלליים

**כתובת בסיס:** בפיתוח `http://localhost:3000`. כל הכתובות כאן יחסיות (למשל `/api/jobs`).

**התחברות:** ההתחברות נעשית עם Supabase בדפדפן, והיא נשמרת ב-cookies. כשקוראים ל-API מאותו אתר, ה-cookies נשלחים אוטומטית ואין צורך להוסיף כלום.

```ts
import { createClient } from "@/lib/supabase/browser";

const supabase = createClient();

// הרשמה, שלב 1: נשלח מייל עם קוד אימות (ראו "תהליך ההרשמה" למטה)
await supabase.auth.signUp({ email, password });
// הרשמה, שלב 2: המשתמש מקליד את הקוד באותו דף, והסשן נפתח
await supabase.auth.verifyOtp({ email, token: code, type: "email" });

// התחברות
await supabase.auth.signInWithPassword({ email, password });

// התנתקות
await supabase.auth.signOut();

// שכחתי סיסמה: נשלח מייל עם קישור לדף /reset-password
await supabase.auth.resetPasswordForEmail(email);
// בדף /reset-password, אחרי שהמשתמש נכנס דרך הקישור:
await supabase.auth.updateUser({ password: newPassword });

// התחברות עם גוגל (אין צורך באישור מייל)
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
});
```

**פונקציית עזר מומלצת לקריאות:**

```ts
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw json.error; // { code, message }
  return json;
}

// דוגמאות
const { data } = await api<{ data: Job[] }>("/api/jobs?category=logo");
await api("/api/jobs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "לוגו לבית קפה", description: "...", category: "logo" }),
});
```

**פורמט תשובה:**
- פריט בודד: `{ "data": { ... } }`
- רשימה עם עימוד: `{ "data": [ ... ], "pagination": { "page": 1, "pageSize": 20, "total": 57 } }`
- שגיאה: `{ "error": { "code": "NOT_FOUND", "message": "Job not found" } }`

**קודי שגיאה נפוצים:**

| סטטוס | code | משמעות |
|---|---|---|
| 400 | `VALIDATION_ERROR` | נתון חסר או לא תקין. ה-`message` מפרט איזה שדה. |
| 400 | `INVALID_JSON` | גוף הבקשה אינו JSON תקין |
| 401 | `UNAUTHORIZED` | לא מחוברת |
| 403 | `FORBIDDEN` | מחוברת אבל אין הרשאה |
| 403 | `PROFILE_INCOMPLETE` | **כבוי זמנית** - אף endpoint לא מחזיר את זה כרגע (ראו "תהליך ההרשמה" למטה) |
| 404 | `NOT_FOUND` | לא קיים, או שאין לך הרשאה לראות אותו |
| 409 | (שונה לפי המקרה) | התנגשות, למשל כבר הוגשה הצעה |
| 500 | `INTERNAL_ERROR` | תקלה בשרת |

**תפקידים:** `user` (רגיל) ו-`admin`. כל משתמש יכול גם לפרסם משרות וגם להציע שירותי עיצוב.

**תהליך ההרשמה (בדף אחד, בלי קישור):**
1. `signUp({ email, password })`. המשתמש מקבל מייל עם קוד, והדף עובר למצב "הכנס קוד".
2. `verifyOtp({ email, token, type: "email" })`. אחרי זה המשתמש מחובר (הסשן ב-cookies).
3. אותו דף מציג את טופס הפרטים. בסיום שומרים עם `PATCH /api/me` (ואפשר `POST /api/me/logo`), ואז קוראים ל-`POST /api/me/complete`.
4. עד שקראת ל-`complete` בהצלחה, `onboarded` ב-`GET /api/me` הוא `false`. **זמנית** (עד שהחסימה תוחזר), פעולות יצירה (פרסום משרה, הצעה, פתיחת שיחה, שליחת הודעה) **לא** נדחות בגלל זה - רק בדיקת ההתחברות (`401`) נשארת. `POST /api/me/complete` עדיין קיים ועדיין מעדכן את `onboarded` ל-`true`.

בכל כניסה לאתר כדאי לקרוא ל-`GET /api/me`, ואם `onboarded` הוא `false`, להחזיר את המשתמש לשלב 3. זה מכסה גם מי שסגר את הדף באמצע, וגם מי שנרשם עם גוגל. (ברגע שהחסימה תוחזר, גם פעולות היצירה ייתקעו עד סיום השלב הזה.)

---

## 2. פרופיל

### `GET /api/me`: הפרופיל המלא שלי
תשובה (200):
```json
{ "data": {
  "id": "uuid", "email": "me@example.com", "display_name": "Noa", "bio": null,
  "categories": ["logo"], "is_designer": false, "availability": "available",
  "logo_url": null, "portfolio_url": null, "notify_email": true,
  "role": "user", "onboarded": true, "created_at": "2026-10-17T18:36:55Z" } }
```
`onboarded` הוא `false` עד שההרשמה הושלמה (ראו `POST /api/me/complete`).

### `PATCH /api/me`: עדכון הפרופיל שלי
כל השדות אופציונליים. שדה לא מוכר (כמו `role`) נדחה ב-400.

| שדה | סוג | כללים |
|---|---|---|
| `display_name` | string | 3 עד 30 תווים, ייחודי |
| `bio` | string או null | עד 500 |
| `categories` | string[] | מתוך `logo`, `flyer`, `banner`, `social`, `video`, `ad`, `other` (עד 5) |
| `is_designer` | boolean | "אני מציעה שירותי עיצוב" |
| `availability` | string | `available` או `unavailable` |
| `portfolio_url` | string או null | כתובת URL תקינה |
| `notify_email` | boolean | האם לקבל התראות במייל |

שגיאות: `400 VALIDATION_ERROR`, `409 DISPLAY_NAME_TAKEN`.

### `POST /api/me/complete`: סיום ההרשמה
בלי גוף בקשה. קוראים לזה אחרי ששמרתם את הפרטים ב-`PATCH /api/me`. השרת קורא את הפרופיל השמור ובודק:
- `display_name` שונה מהשם הזמני שנוצר אוטומטית (`user_xxxxxxxx`).
- אם `is_designer` הוא `true`, יש לפחות קטגוריה אחת ב-`categories`.

הצלחה (200): הפרופיל המלא, עם `onboarded: true`. אפשר לקרוא שוב בלי נזק.
שגיאות: `400 ONBOARDING_INCOMPLETE` (ה-`message` מפרט מה חסר), `401`.

### `POST /api/me/logo`: העלאת לוגו
שולחים `multipart/form-data` עם שדה בשם `file` (PNG, JPEG או WebP, עד 2MB).

```ts
const form = new FormData();
form.append("file", fileInput.files[0]);
const { data } = await api<{ data: { logo_url: string } }>("/api/me/logo", { method: "POST", body: form });
```
אל תגדירי `Content-Type` ידנית. תשובה: `{ "data": { "logo_url": "https://..." } }`.
שגיאות: `400 INVALID_FILE_TYPE`, `413 FILE_TOO_LARGE`.

### `GET /api/profiles/{id}`: פרופיל ציבורי של מישהו אחר
מחזיר **רק** את השדות האלה (אף פעם לא מייל או טלפון):
```json
{ "data": { "id": "uuid", "display_name": "Dana", "bio": "...", "categories": ["logo"],
  "availability": "available", "logo_url": "https://...", "portfolio_url": null } }
```
שגיאות: `400` (id לא תקין), `404`.

### `GET /api/designers`: רשימת מעצבים
פרמטרים: `availability` (`available`/`unavailable`), `category`, `q` (חיפוש בשם ובתיאור), `page`, `pageSize` (עד 50, ברירת מחדל 20).
תשובה: רשימה של פרופילים ציבוריים + `pagination`.

---

## 3. משרות

אובייקט משרה:
```json
{ "id": "uuid", "owner_id": "uuid", "title": "לוגו לבית קפה", "description": "...",
  "category": "logo", "budget": 800, "deadline": "2026-10-25T12:00:00Z",
  "status": "open", "created_at": "...", "updated_at": "...",
  "owner": { "id": "uuid", "display_name": "Noa", "logo_url": null } }
```
סטטוסים: `open` (פתוחה), `in_progress` (בעבודה), `closed` (סגורה).

### `GET /api/jobs`: רשימת משרות
משתמש רגיל רואה את המשרות שלו + כל המשרות הפתוחות. אדמין רואה הכול.

| פרמטר | משמעות |
|---|---|
| `q` | חיפוש בכותרת ובתיאור |
| `category` | `logo`, `flyer`, `banner`, `social`, `video`, `ad`, `other` |
| `status` | `open`, `in_progress`, `closed` |
| `sort` | `deadline`, `budget` או `created_at` (ברירת מחדל) |
| `order` | `asc` או `desc` (ברירת מחדל) |
| `page`, `pageSize` | עימוד (עד 50) |

דוגמה: `/api/jobs?q=logo&category=logo&sort=budget&order=asc&page=1`

### `POST /api/jobs`: יצירת משרה
```json
{ "title": "לוגו לבית קפה", "description": "תיאור...", "category": "logo",
  "budget": 800, "deadline": "2026-12-01T12:00:00+02:00" }
```
`budget` ו-`deadline` אופציונליים. `deadline` חייב להיות עתידי. המשרה נוצרת תמיד כ-`open`, ואת הבעלים קובע השרת. תשובה: 201 עם המשרה.

### `GET /api/jobs/{id}`: משרה אחת
שגיאות: `404`.

### `PATCH /api/jobs/{id}`: עריכה (בעלים או אדמין)
אפשר לשלוח כל שדה מהיצירה, וגם `status`. שגיאות: `403 FORBIDDEN`, `404`.

### `DELETE /api/jobs/{id}`: מחיקה (בעלים או אדמין)
תשובה: `{ "data": { "id": "uuid" } }`.

---

## 4. הצעות מחיר

אובייקט הצעה:
```json
{ "id": "uuid", "job_id": "uuid", "designer_id": "uuid", "message": "אשמח לעזור",
  "price": 700, "delivery_hours": 48, "status": "pending", "created_at": "...",
  "designer": { "id": "uuid", "display_name": "Dana", "bio": null, "categories": [],
                "availability": "available", "logo_url": null, "portfolio_url": null } }
```
סטטוסים: `pending`, `accepted`, `rejected`.

### `GET /api/jobs/{id}/proposals`
בעלת המשרה רואה את כל ההצעות. מעצבת רואה רק את ההצעה שלה. אדמין רואה הכול.

### `POST /api/jobs/{id}/proposals`: הגשת הצעה
```json
{ "message": "אני יכולה לעשות את זה", "price": 700, "delivery_hours": 48 }
```
תשובה: 201. שגיאות: `403 OWN_JOB` (המשרה שלך), `409 JOB_NOT_OPEN` (המשרה לא פתוחה), `409 ALREADY_PROPOSED` (כבר הגשת), `404`.
בעלת המשרה מקבלת מייל התראה.

### `PATCH /api/proposals/{id}`: אישור או דחייה (בעלת המשרה בלבד)
```json
{ "status": "accepted" }
```
הערך `accepted` או `rejected`. שגיאות: `403 FORBIDDEN`, `404`, `409 ALREADY_DECIDED` (כבר הוחלט).

---

## 5. שיחות והודעות

### `GET /api/conversations`: השיחות שלי
```json
{ "data": [ {
  "id": "uuid", "job_id": "uuid או null", "job_title": "לוגו לבית קפה או null",
  "created_at": "...",
  "other_user": { "id": "uuid", "display_name": "Dana", "...": "פרופיל ציבורי" },
  "last_message": { "id": "uuid", "sender_id": "uuid", "body": "...", "created_at": "...", "read_at": null }
} ] }
```
ממוין לפי הפעילות האחרונה. `last_message` יכול להיות `null`.

### `POST /api/conversations`: פתיחת שיחה (או קבלת הקיימת)
```json
{ "jobId": "uuid (אופציונלי)", "otherUserId": "uuid" }
```
- עם `jobId`: השיחה חייבת להיות בין בעלת המשרה למעצבת שהגישה הצעה עליה.
- בלי `jobId`: הודעה ישירה, מותרת רק למעצבת שמוגדרת `is_designer` וגם `available`.
- אם השיחה כבר קיימת, מקבלים 200 עם הקיימת. אם נוצרה חדשה, 201.

שגיאות: `400` (שיחה עם עצמך), `403 FORBIDDEN`, `403 DESIGNER_UNAVAILABLE`, `404`.

### `GET /api/conversations/{id}/messages`: הודעות
כל הודעה: `{ "id", "conversation_id", "sender_id", "body", "created_at", "read_at" }`, מהישנה לחדשה (עד 100).
פתיחת השיחה מסמנת את ההודעות של הצד השני כנקראו.

**עדכון חי (polling):** שולחים `?after=<created_at של ההודעה האחרונה שיש לך>` ומקבלים רק הודעות חדשות יותר. חשוב לקודד את הערך:

```ts
const url = `/api/conversations/${id}/messages?after=${encodeURIComponent(lastCreatedAt)}`;
// הרצה כל כמה שניות:
setInterval(async () => { const { data } = await api<{ data: Message[] }>(url); /* ... */ }, 5000);
```
אל תשכחי לעדכן את `lastCreatedAt` אחרי שמגיעות הודעות חדשות.

### `POST /api/conversations/{id}/messages`: שליחת הודעה
```json
{ "body": "שלום!" }
```
1 עד 5000 תווים. תשובה: 201 עם ההודעה. שגיאות: `403` (לא משתתפת בשיחה), `404`.
הצד השני מקבל מייל התראה (מקסימום אחד לשיחה כל 5 דקות).

---

## 6. אדמין (דורש `role = admin`, אחרת 403)

- `GET /api/admin/users`: רשימת משתמשים. כל פריט: `id`, `display_name`, `role`, `is_designer`, `availability`, `created_at` (בלי מייל). פרמטרים: `page`, `pageSize`.
- `GET /api/admin/jobs`: כל המשרות, בכל סטטוס. אותם פרמטרים כמו `GET /api/jobs`.
- `DELETE /api/admin/jobs/{id}`: מחיקת כל משרה.

---

## 7. נתיבי התחברות (לא JSON)

אלה כתובות שהמשתמש נכנס אליהן מהדפדפן, והן מפנות הלאה:

- `GET /auth/callback?code=...&next=/`: נקודת החזרה אחרי התחברות עם גוגל.
- `GET /auth/confirm?token_hash=...&type=email|recovery&next=/`: הקישור שבמיילים (אימות הרשמה ואיפוס סיסמה).
- אם הקישור לא תקין או שפג תוקפו, מפנים אל `/login?error=auth`. כדאי שיהיה לך דף כזה.

ה-`next` חייב להיות נתיב בתוך האתר (מתחיל ב-`/`).
