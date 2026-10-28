// GET /api/designers -> people who offer design services (is_designer = true),
// with filters and pagination. Only PUBLIC profile fields are returned.
import { ApiError, handleError } from "@/lib/api/errors";
import { escapeSearch } from "@/lib/api/listJobs";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { toPublicProfile } from "@/lib/mappers/toPublicProfile";
import { createClient } from "@/lib/supabase/server";
import { listDesignersQuerySchema } from "@/lib/validation/designers";
import { queryToObject } from "@/lib/validation/jobs";

export async function GET(request: Request) {
  try {
    await requireUser();
    const query = listDesignersQuerySchema.parse(queryToObject(new URL(request.url).searchParams));

    const supabase = await createClient();
    let builder = supabase
      .from("profiles")
      .select("id, display_name, bio, categories, availability, logo_url, portfolio_url", {
        count: "exact",
      })
      .eq("is_designer", true)
      .eq("onboarded", true); // half-finished sign-ups are not listed

    if (query.availability) builder = builder.eq("availability", query.availability);
    if (query.category) builder = builder.contains("categories", [query.category]);
    if (query.q) {
      const pattern = `%${escapeSearch(query.q)}%`;
      builder = builder.or(`display_name.ilike.${pattern},bio.ilike.${pattern}`);
    }

    const from = (query.page - 1) * query.pageSize;
    const { data, count, error } = await builder
      .order("display_name")
      .order("id")
      .range(from, from + query.pageSize - 1);
    if (error) throw new ApiError(500, "QUERY_FAILED", "Could not load designers");

    return Response.json({
      data: (data ?? []).map(toPublicProfile),
      pagination: { page: query.page, pageSize: query.pageSize, total: count ?? 0 },
    });
  } catch (err) {
    return handleError(err);
  }
}
