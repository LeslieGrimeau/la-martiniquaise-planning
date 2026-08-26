"use client";

type Props = {
  selectedSection: "questions" | "subs";
};

export default function WheelSectionSelector({
  selectedSection,
}: Props) {
  return (
    <div className="mb-8">
      <label
        htmlFor="wheel-section"
        className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
      >
        Choisir une catégorie
      </label>

      <select
        id="wheel-section"
        value={selectedSection}
        onChange={(event) => {
          const section =
            event.target.value === "subs"
              ? "subs"
              : "questions";

          window.location.href = `/admin/roues?section=${section}`;
        }}
        className="w-full max-w-md rounded-2xl border border-pink-500/30 bg-[#09090f] px-5 py-4 font-bold text-white outline-none transition focus:border-pink-400"
      >
        <option value="questions">
          🎡 Roue Questions
        </option>

        <option value="subs">
          💜 Roues Subs
        </option>
      </select>
    </div>
  );
}