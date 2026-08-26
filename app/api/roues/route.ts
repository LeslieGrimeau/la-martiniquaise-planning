import { NextResponse } from "next/server";

import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const wheelId = Number(searchParams.get("wheelId") ?? 1);

    if (!Number.isFinite(wheelId)) {
      return NextResponse.json(
        { error: "Roue invalide" },
        { status: 400 }
      );
    }

    const wheelRows = await sql`
      SELECT
        id,
        name,
        type
      FROM wheels
      WHERE id = ${wheelId}
      LIMIT 1
    `;

    if (wheelRows.length === 0) {
      return NextResponse.json(
        { error: "Roue introuvable" },
        { status: 404 }
      );
    }

    const items = await sql`
      SELECT
        id,
        label,
        sort_order
      FROM wheel_items
      WHERE wheel_id = ${wheelId}
      ORDER BY sort_order ASC
    `;

    return NextResponse.json(
      {
        wheel: {
          id: Number(wheelRows[0].id),
          name: String(wheelRows[0].name),
          type: String(wheelRows[0].type),
        },
        items: items.map((item) => ({
          id: Number(item.id),
          label: String(item.label),
          sort_order: Number(item.sort_order),
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Erreur API roues :", error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}