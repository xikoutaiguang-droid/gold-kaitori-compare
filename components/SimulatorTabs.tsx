"use client";

import { useState } from "react";
import type { Company } from "@/lib/types";
import SimulatorForm from "@/components/SimulatorForm";
import MultiItemCalculator from "@/components/MultiItemCalculator";

export default function SimulatorTabs({ companies }: { companies: Company[] }) {
  const [mode, setMode] = useState<"single" | "multi">("single");

  return (
    <div>
      <div className="mb-5 inline-flex rounded-full border border-border bg-surface p-1 text-sm">
        <button
          onClick={() => setMode("single")}
          className={`rounded-full px-4 py-1.5 transition ${
            mode === "single" ? "bg-accent text-accent-foreground" : "text-foreground/70"
          }`}
        >
          かんたん計算
        </button>
        <button
          onClick={() => setMode("multi")}
          className={`rounded-full px-4 py-1.5 transition ${
            mode === "multi" ? "bg-accent text-accent-foreground" : "text-foreground/70"
          }`}
        >
          複数点まとめて計算
        </button>
      </div>

      {mode === "single" ? (
        <SimulatorForm companies={companies} />
      ) : (
        <MultiItemCalculator companies={companies} />
      )}
    </div>
  );
}
