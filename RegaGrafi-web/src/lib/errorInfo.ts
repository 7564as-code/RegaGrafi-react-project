import { ApiRequestError } from "../api/client";

export type ErrorInfo = {
    status: number,
    title: string,
    text: string,
}

// ממיר כל שגיאה להודעה בעברית שמתאימה למשתמשת.
export function getErrorInfo(error: unknown): ErrorInfo {
    const status = error instanceof ApiRequestError ? error.status : -1

    if (status === 0)
        return { status, title: "אין חיבור", text: "בדקי את החיבור לאינטרנט ונסי שוב." }
    if (status === 401)
        return { status, title: "צריך להתחבר", text: "כדי להמשיך יש להתחבר לחשבון." }
    if (status === 403)
        return { status, title: "אין לך הרשאה לזה", text: "נראה שהפעולה הזו לא זמינה עבור החשבון שלך." }
    if (status === 404)
        return { status, title: "לא מצאנו את מה שחיפשת", text: "ייתכן שהתוכן הוסר או שהכתובת שגויה." }
    if (status === 409)
        return { status, title: "הפעולה כבר בוצעה", text: "ייתכן שכבר שלחת את זה בעבר." }
    if (status === 400 || status === 422)
        return { status, title: "הנתונים שנשלחו לא תקינים", text: "בדקי את הפרטים ונסי שוב." }
    if (status === 429)
        return { status, title: "יותר מדי ניסיונות", text: "נסי שוב בעוד כמה רגעים." }
    if (status >= 500)
        return { status, title: "משהו השתבש אצלנו", text: "זה לא באשמתך. נסי שוב בעוד רגע." }

    return { status, title: "אירעה שגיאה", text: "נסי שוב בעוד רגע." }
}
