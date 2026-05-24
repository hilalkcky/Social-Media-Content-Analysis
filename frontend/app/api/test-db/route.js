import { poolPromise } from "@/lib/db";

export async function GET() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT 1 AS test");

    return Response.json({ success: true, data: result.recordset });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}