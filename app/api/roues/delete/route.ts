import { NextResponse } from "next/server";

import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const wheelId = Number(body.wheelId);
    const itemId = Number(body.itemId);

    if (
      !Number.isFinite(wheelId) ||
      !Number.isFinite(itemId)
    ) {
      return NextResponse.json(
        {
          error: "Roue ou élément invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await sql`
      DELETE FROM wheel_items
      WHERE id = ${itemId}
        AND wheel_id = ${wheelId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          error: "Cet élément n'existe plus dans cette roue.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      itemId,
    });
  } catch (error) {
    console.error(
      "Erreur suppression élément roue :",
      error
    );

    return NextResponse.json(
      {
        error: "Erreur serveur lors de la suppression.",
      },
      {
        status: 500,
      }
    );
  }
}