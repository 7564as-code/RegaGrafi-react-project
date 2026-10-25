// GET /api/admin/users -> list users (admin only), paginated.
// Emails are deliberately NOT returned: the API never exposes another user's email.
import { ApiError, handleError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { paginationSchema, queryToObject } from "@/lib/validation/jobs";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { page, pageSize } = paginationSchema.parse(
      queryToObject(new URL(request.url).searchParams)
    );

    const from = (page - 1) * pageSize;
    const supabase = await createClient();
    const { data, count, error } = await supabase
      .from("profiles")
      .select("id, display_name, role, is_designer, availability, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, from + pageSize - 1);

    if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load users");

    return Response.json({ data, pagination: { page, pageSize, total: count ?? 0 } });
  } catch (err) {
    return handleError(err);
  }
}
