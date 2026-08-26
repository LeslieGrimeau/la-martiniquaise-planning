import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import WheelSectionSelector from "./WheelSectionSelector";


import { sql } from "@/lib/db";

const COOKIE_NAME = "admin_session";

type Wheel = {
  id: number;
  name: string;
  type: string;
  trigger_type: string;
  active: boolean;
};

type WheelItem = {
  id: number;
  wheel_id: number;
  label: string;
  sort_order: number;
};

function isValidSession(token: string | undefined) {
  if (!token) return false;

  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) return false;

  const parts = token.split(".");

  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) return false;

  if (Date.now() - timestampNumber > 7 * 24 * 60 * 60 * 1000) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`la-martiniquaise-admin:${timestamp}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/* =========================================================
   SAUVEGARDE / AJOUT
========================================================= */

async function saveWheelItems(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const wheelId = Number(formData.get("wheelId"));
  const operation = String(formData.get("operation") ?? "save");

  if (!Number.isFinite(wheelId)) {
    redirect("/admin/roues?error=1");
  }

  try {
    /* AJOUT */
    if (operation === "add") {
      const result = await sql`
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
        FROM wheel_items
        WHERE wheel_id = ${wheelId}
      `;

      const nextOrder = Number(result[0]?.next_order ?? 1);

      await sql`
        INSERT INTO wheel_items (
          wheel_id,
          label,
          sort_order
        )
        VALUES (
          ${wheelId},
          'Nouvel élément',
          ${nextOrder}
        )
      `;

      revalidatePath("/admin/roues");

      redirect(
        `/admin/roues?saved=1&section=${
          wheelId === 1 ? "questions" : "subs"
        }`
      );
    }
    
        /* SAUVEGARDE */
    const itemIds = formData.getAll("itemId");
    const labels = formData.getAll("label");

    if (itemIds.length !== labels.length) {
      redirect("/admin/roues?error=1");
    }

    for (let i = 0; i < itemIds.length; i++) {
      const itemId = Number(itemIds[i]);
      const label = String(labels[i] ?? "").trim();

      if (!Number.isFinite(itemId) || !label) {
        continue;
      }

      await sql`
        UPDATE wheel_items
        SET label = ${label}
        WHERE id = ${itemId}
          AND wheel_id = ${wheelId}
      `;
    }

    revalidatePath("/admin/roues");
  } catch (error) {
    console.error("Erreur sauvegarde roue :", error);
    redirect("/admin/roues?error=1");
  }

  redirect(
    `/admin/roues?saved=1&section=${
      wheelId === 1 ? "questions" : "subs"
    }`
  );
}
async function deleteWheelItem(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const wheelId = Number(formData.get("wheelId"));
  const itemId = Number(formData.get("deleteItemId"));

  if (!Number.isFinite(wheelId) || !Number.isFinite(itemId)) {
    redirect("/admin/roues?error=1");
  }

  try {
    await sql`
      DELETE FROM wheel_items
      WHERE id = ${itemId}
        AND wheel_id = ${wheelId}
    `;

    revalidatePath("/admin/roues");
  } catch (error) {
    console.error("Erreur suppression élément :", error);
    redirect("/admin/roues?error=1");
  }

  redirect(
    `/admin/roues?saved=1&section=${
      wheelId === 1 ? "questions" : "subs"
    }`
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function WheelsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    section?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const params = await searchParams;

  const selectedSection =
    params.section === "subs" ? "subs" : "questions";

  const wheelRows = await sql`
    SELECT
      id,
      name,
      type,
      trigger_type,
      active
    FROM wheels
    ORDER BY id ASC
  `;

  const itemRows = await sql`
    SELECT
      id,
      wheel_id,
      label,
      sort_order
    FROM wheel_items
    ORDER BY wheel_id ASC, sort_order ASC
  `;

  const wheels: Wheel[] = wheelRows.map((wheel) => ({
    id: Number(wheel.id),
    name: String(wheel.name),
    type: String(wheel.type),
    trigger_type: String(wheel.trigger_type),
    active: Boolean(wheel.active),
  }));

  const items: WheelItem[] = itemRows.map((item) => ({
    id: Number(item.id),
    wheel_id: Number(item.wheel_id),
    label: String(item.label),
    sort_order: Number(item.sort_order),
  }));

  const questionsWheel = wheels.find(
    (wheel) => wheel.id === 1
  );

  const subsWheels = wheels.filter((wheel) =>
    [2, 3, 4].includes(wheel.id)
  );

  return (
    <main className="min-h-screen bg-[#050509] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8">
          <a
            href="/admin"
            className="text-sm font-semibold text-pink-300 transition hover:text-pink-200"
          >
            ← Retour au tableau de bord
          </a>

          <div className="mt-5">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-300">
              🔐 Administration
            </p>

            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              🎡 Gestion des roues
            </h1>

            <p className="mt-3 text-gray-400">
              Configure les roues utilisées pendant tes lives.
            </p>
          </div>
        </header>

        {/* MESSAGES */}
        {params.saved === "1" && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-semibold text-green-300">
            ✅ Les modifications ont été enregistrées !
          </div>
        )}

        {params.error === "1" && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-semibold text-red-300">
            ❌ Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        <WheelSectionSelector
  selectedSection={selectedSection}
/>

        {/* ROUE QUESTIONS */}
        {selectedSection === "questions" && questionsWheel && (
          <WheelEditor
            wheel={questionsWheel}
            items={items.filter(
              (item) => item.wheel_id === questionsWheel.id
            )}
            saveAction={saveWheelItems}
          />
        )}

        {/* ROUES SUBS */}
        {selectedSection === "subs" && (
          <div className="grid gap-8">
            {subsWheels.map((wheel) => (
              <WheelEditor
                key={wheel.id}
                wheel={wheel}
                items={items.filter(
                  (item) => item.wheel_id === wheel.id
                )}
                saveAction={saveWheelItems}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

/* =========================================================
   EDITEUR
========================================================= */

function WheelEditor({
  wheel,
  items,
  saveAction,
}: {
  wheel: Wheel;
  items: WheelItem[];
  saveAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={saveAction}>

      <input
        type="hidden"
        name="wheelId"
        value={wheel.id}
      />

      <section
        className="rounded-3xl p-[2px]"
        style={{
          background:
            "linear-gradient(135deg, #ec4899, #f472b6, #c084fc, #ec4899)",
        }}
      >
        <div className="rounded-[22px] bg-[#09090f] p-6 md:p-8">

          {/* TITRE */}
          <div className="mb-6">
            <h2 className="text-2xl font-black">
              {getWheelEmoji(wheel.type)} {wheel.name}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {getWheelDescription(wheel.type)}
            </p>
          </div>

          {/* ELEMENTS */}
          <div className="space-y-4">

            {items.map((item, index) => (
  <div
    key={item.id}
    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
  >
    <div className="flex items-start gap-3">

      <div className="min-w-0 flex-1">
        <label
          htmlFor={`wheel-${wheel.id}-item-${item.id}`}
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-pink-300"
        >
          {getItemLabel(wheel.type, index)}
        </label>

        <input
          id={`wheel-${wheel.id}-item-${item.id}`}
          name="label"
          type="text"
          defaultValue={item.label}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-400/60"
        />

        <input
          type="hidden"
          name="itemId"
          value={item.id}
        />
      </div>

      <button
  type="submit"
  formAction={deleteWheelItem}
  name="deleteItemId"
  value={item.id}
  className="mt-6 shrink-0 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-red-300 transition hover:bg-red-500/20"
  title="Supprimer"
>
  🗑️
</button>

    </div>
  </div>
))}

          </div>

          {/* BOUTONS */}
          <div className="mt-8 flex flex-wrap justify-between gap-4">

            <button
              type="submit"
              name="operation"
              value="add"
              className="rounded-xl border border-pink-400/30 bg-pink-500/10 px-6 py-3 font-bold text-pink-300 transition hover:bg-pink-500/20"
            >
              ➕ Ajouter un élément
            </button>

            <button
              type="submit"
              name="operation"
              value="save"
              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-7 py-3 font-black text-white transition hover:scale-[1.02]"
            >
              💾 Enregistrer
            </button>

          </div>

        </div>
      </section>

    </form>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getWheelEmoji(type: string) {
  switch (type) {
    case "questions":
      return "🎡";
    case "action_verite":
      return "🎭";
    case "action":
      return "🔥";
    case "verite":
      return "🤫";
    default:
      return "🎡";
  }
}

function getWheelDescription(type: string) {
  switch (type) {
    case "questions":
      return "Questions pour les lives — toi et tes modérateurs pouvez la lancer quand vous voulez.";

    case "action_verite":
      return "Déclenchée à chaque don de 5 subs ou 100 bits.";

    case "action":
      return "Défis de la roue Action.";

    case "verite":
      return "Questions de la roue Vérité.";

    default:
      return "Configuration de la roue.";
  }
}

function getItemLabel(type: string, index: number) {
  if (type === "questions") {
    return `Question ${index + 1}`;
  }

  if (type === "action_verite") {
    return index === 0 ? "Résultat 1" : "Résultat 2";
  }

  if (type === "action") {
    return `Action ${index + 1}`;
  }

  if (type === "verite") {
    return `Vérité ${index + 1}`;
  }

  return `Élément ${index + 1}`;
}