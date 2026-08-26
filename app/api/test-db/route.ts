import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`SELECT NOW() AS now`;

    return Response.json({
      success: true,
      message: "Connexion à Neon réussie !",
      time: result[0]?.now,
    });
  } catch (error) {
    console.error("Erreur Neon :", error);

    return Response.json(
      {
        success: false,
        message: "Impossible de se connecter à Neon.",
      },
      { status: 500 }
    );
  }
}