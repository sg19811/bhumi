import { getAdminUserId } from "@/app/lib/ai/require-user";
import { checkDuplicate, type DupCheckInput } from "@/app/lib/duplicates";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await getAdminUserId(req))) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Admins only." } }, { status: 401 });
  }
  let body: Partial<DupCheckInput>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: { code: "INVALID_REQUEST", message: "Invalid request." } }, { status: 400 });
  }

  const result = await checkDuplicate({
    district: String(body.district ?? ""),
    taluka: String(body.taluka ?? ""),
    village: String(body.village ?? ""),
    survey_number: body.survey_number ?? null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    description: body.description ?? null,
  });
  return Response.json(result);
}
