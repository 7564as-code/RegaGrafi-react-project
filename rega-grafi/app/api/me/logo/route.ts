// POST /api/me/logo  (multipart/form-data, field name: "file")
// Validates the image, uploads it to Storage under "<user_id>/", saves profiles.logo_url.
import { ApiError, handleError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Checks the first bytes of the file. The browser-provided type can be faked, the bytes cannot. */
function looksLikeImage(bytes: Uint8Array, type: string) {
  if (type === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/webp") {
    // "RIFF" .... "WEBP"
    return (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    );
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "VALIDATION_ERROR", 'Send an image in a form field named "file"');
    }

    const extension = EXTENSIONS[file.type];
    if (!extension) {
      throw new ApiError(400, "INVALID_FILE_TYPE", "Only PNG, JPEG or WebP images are allowed");
    }
    if (file.size > MAX_SIZE) {
      throw new ApiError(413, "FILE_TOO_LARGE", "The image must be 2MB or smaller");
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    if (!looksLikeImage(buffer, file.type)) {
      throw new ApiError(400, "INVALID_FILE_TYPE", "The file content is not a valid image");
    }

    // Uses the user's own session, so the Storage policy (own folder only) applies.
    const supabase = await createClient();
    const path = `${user.id}/logo.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (uploadError) throw new ApiError(500, "UPLOAD_FAILED", "Could not upload the image");

    // Remove an older logo with a different extension, if there is one.
    const oldPaths = Object.values(EXTENSIONS)
      .filter((ext) => ext !== extension)
      .map((ext) => `${user.id}/logo.${ext}`);
    await supabase.storage.from("logos").remove(oldPaths);

    // "?v=" makes browsers load the new image instead of a cached old one.
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
    const logoUrl = `${urlData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ logo_url: logoUrl })
      .eq("id", user.id);
    if (updateError) throw new ApiError(500, "UPDATE_FAILED", "Could not save the logo address");

    return Response.json({ data: { logo_url: logoUrl } });
  } catch (err) {
    return handleError(err);
  }
}
