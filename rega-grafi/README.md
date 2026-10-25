# רגע גרפי: צד השרת (API)

פלטפורמה שבה כל אחד יכול לפרסם משרות עיצוב גרפי דחופות, ומעצבים מגישים הצעות ומשוחחים בצ'אט פרטי.
הפרויקט בנוי עם Next.js 16 (App Router), Supabase (מסד נתונים, התחברות ואחסון), Zod ו-Resend.

הריפו כולל את צד השרת בלבד: מסד הנתונים, כללי ההרשאות וה-API. את ממשק ה-React כותבים בנפרד.
תיעוד כל ה-API נמצא ב-[docs/api.md](docs/api.md), ובקשות לדוגמה ב-[docs/api.http](docs/api.http).

## 1. דרישות

- Node.js מותקן
- חשבון Supabase (חינמי)
- חשבון Resend עם דומיין מאומת (לשליחת מיילים)

## 2. התקנה

```bash
npm install
```

## 3. הגדרת Supabase

1. נכנסים ל-[supabase.com](https://supabase.com) ויוצרים פרויקט חדש.
2. ב-Project Settings ואז API Keys מעתיקים שלושה ערכים: כתובת הפרויקט (Project URL), המפתח הציבורי (Publishable key) והמפתח הסודי (Secret key).
3. יוצרים בתיקיית הפרויקט קובץ בשם `.env.local` (מועתק מ-`.env.example`) וממלאים:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
EMAIL_FROM=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- **`SUPABASE_SECRET_KEY` ו-`RESEND_API_KEY` הם סודות.** לעולם לא מעלים אותם ל-git ולא משתפים אותם. הקובץ `.env.local` כבר מוחרג ב-`.gitignore`.
- `EMAIL_FROM` הוא כתובת על הדומיין המאומת ב-Resend, למשל `Raga Grafi <noreply@yourdomain.com>`.

## 4. הרצת המיגרציות (יצירת הטבלאות)

מיגרציה היא קובץ SQL שיוצר או משנה טבלאות במסד. מריצים את ארבעת הקבצים **לפי הסדר**:

1. ב-Supabase נכנסים ל-**SQL Editor** ואז **New query**.
2. מדביקים ומריצים (Run) כל קובץ מתיקיית [supabase/migrations](supabase/migrations):
   1. `001_tables.sql`: הטבלאות, האינדקסים והטריגרים.
   2. `002_rls.sql`: כללי ההרשאות (RLS) ופונקציית `is_admin()`.
   3. `003_storage.sql`: הבאקט `logos` להעלאת לוגואים.
   4. `004_more_categories.sql`: מוסיף את הקטגוריות `video` ו-`ad`.
3. אם מופיע חלון "Potential issue detected", בוחרים **Run and enable RLS**.

כל קובץ אמור להסתיים ב-`Success`.

## 5. נתוני בדיקה (seed)

הסקריפט יוצר אדמין אחד, שלושה משתמשים רגילים, עשר משרות, כמה הצעות ושיחה אחת. מריצים בטרמינל:

```bash
npx tsx --env-file=.env.local scripts/seed.ts
```

משתמשי הבדיקה (הסיסמה לכולם `Test1234!`):

| תפקיד | מייל |
|---|---|
| admin | admin@test.com |
| user (מעצבת) | dana@test.com |
| user (מעצב) | yossi@test.com |
| user | noa@test.com |

אפשר להריץ שוב בלי בעיה. הנתונים הקיימים מזוהים ולא נוצרים פעמיים. **להריץ רק על פרויקט פיתוח, לא על אתר אמיתי.**

## 6. בדיקת ההרשאות

הקובץ [supabase/tests/permissions.sql](supabase/tests/permissions.sql) בודק שהכללים עובדים. מדביקים אותו ב-SQL Editor אחרי ה-seed ומריצים. התוצאה היא טבלה, וכל שורה צריכה להיות `PASS`. הבדיקות לא משנות נתונים.

## 7. הפעלת הפרויקט

```bash
npm run dev
```

האתר עולה בכתובת [http://localhost:3000](http://localhost:3000). אחרי שינוי ב-`.env.local` צריך לעצור (Ctrl+C) ולהפעיל מחדש.

## 8. הגדרות Auth ב-Supabase

בדשבורד של Supabase, תחת **Authentication**:

1. **URL Configuration:** Site URL הוא `http://localhost:3000`, ו-Redirect URLs הוא `http://localhost:3000/**`. בפרודקשן מוסיפים את כתובת האתר האמיתית.
2. **Emails ואז SMTP Settings:** מפעילים Custom SMTP: Host `smtp.resend.com`, Port `465`, Username `resend`, Password הוא מפתח ה-API של Resend, ושולח מהדומיין המאומת.
3. **Emails ואז Templates:** בתבניות Confirm signup ו-Reset password מחליפים את הקישור:
   - אימות הרשמה: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/`
   - איפוס סיסמה: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
   - הקישור חייב להיות בשורה אחת, בתוך ה-`href`.
4. **Providers ואז Email:** מוודאים ש-Confirm email מופעל.
5. **Providers ואז Google** (אופציונלי): יוצרים OAuth Client ב-Google Cloud Console ומדביקים את ה-Client ID וה-Secret. נרשמים עם גוגל בלי אישור מייל.

כדי ליצור אדמין: ב-Table Editor, בטבלת `profiles`, משנים את `role` ל-`admin` ידנית. אי אפשר לעשות את זה דרך ה-API.

## 9. מבנה הפרויקט

```
app/api/            נתיבי ה-API (Route Handlers)
app/auth/           נתיבי התחברות (callback ו-confirm)
lib/supabase/       הלקוחות של Supabase: server, browser, admin
lib/auth/           getCurrentUser ו-requireUser / requireAdmin
lib/validation/     סכמות Zod לבדיקת בקשות
lib/mappers/        toPublicProfile: מה אחרים רואים בפרופיל
lib/email/          שליחת מיילים (עטיפה + Resend + ההתראות)
proxy.ts            מרענן את ההתחברות בכל בקשה
supabase/migrations קבצי SQL של המסד
supabase/tests      בדיקות הרשאות
scripts/seed.ts     נתוני בדיקה
docs/               תיעוד ה-API
```

## 10. הרשאות ופרטיות: בקיצור

- **משתמש רגיל:** רואה את המשרות שלו ואת המשרות הפתוחות, עורך ומוחק רק את שלו.
- **אדמין:** רואה, עורך ומוחק כל משרה, ורואה רשימת משתמשים.
- ההרשאות נאכפות פעמיים: ב-Postgres (RLS) ובקוד ה-API. התפקיד נקרא תמיד מה-DB, לעולם לא מהלקוח.
- ה-API **לא מחזיר** מייל או טלפון של משתמש אחר. פרופיל ציבורי כולל רק: `id`, `display_name`, `bio`, `categories`, `availability`, `logo_url`, `portfolio_url`.
- מיילי ההתראות (הצעה חדשה והודעה חדשה) מכילים משפט וקישור בלבד, בלי תוכן ההודעה ובלי פרטי הצד השני. מקסימום מייל אחד לשיחה כל 5 דקות.
- המפתח הסודי של Supabase משמש רק בקוד שרץ בשרת.

## 11. מה לא נכלל

websockets בזמן אמת (השיחות מתעדכנות ב-polling), כפתור חשיפת פרטי קשר הדדי, סגירה אוטומטית של משרות שפג תוקפן, וממשק ה-React.
