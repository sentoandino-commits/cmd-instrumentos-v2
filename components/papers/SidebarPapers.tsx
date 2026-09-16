import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import SeccionSwitch from "@/components/SeccionSwitch";
import PaperCard from "./PaperCard";
import { Paper } from "@/lib/types";

export default function SidebarPapers({ lista }: { lista: Paper[] }) {
  return (
    <aside className="w-72 shrink-0 space-y-3">
      <SeccionSwitch activa="papers" />

      <Suspense fallback={<div className="h-10 rounded-lg bg-paperLight" />}>
        <SearchBar />
      </Suspense>

      <div className="flex flex-col gap-2 pt-2">
        {lista.map((p) => (
          <PaperCard key={p.id} paper={p} compacta />
        ))}
      </div>
    </aside>
  );
}
