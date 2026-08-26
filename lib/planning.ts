import { sql } from "@/lib/db";

export async function getPlanning() {
  const rows = await sql`
    SELECT
      id,
      day,
      session_time,
      games,
      sort_order
    FROM planning
    ORDER BY sort_order ASC
  `;

  return rows.map((row) => ({
    day: row.day,
    sessions:
      row.session_time || (Array.isArray(row.games) && row.games.length > 0)
        ? [
            {
              time: row.session_time,
              games: Array.isArray(row.games) ? row.games : [],
            },
          ]
        : [],
  }));
}