// app/api/users/[userId]/experience/route.js
import { experienceService } from "@/utils/experienceService";


export async function GET(req, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
    }

    const { data, error } = await experienceService.fetchUserExperiences(userId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Always return JSON array
    return new Response(JSON.stringify(data || []), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
