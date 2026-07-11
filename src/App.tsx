import { Suspense } from "react";

import { useComparer } from "@/hooks/useComparer";
import { SpeciesPicker } from "@/views/SpeciesPicker";
import { Comparer } from "@/views/Comparer";

export default function App() {
  const [state, dispatch] = useComparer();

  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        <Suspense
          fallback={
            <div className="py-20 text-center text-muted-foreground">
              Ładowanie…
            </div>
          }
        >
          {state.species ? (
            <Comparer state={state} dispatch={dispatch} />
          ) : (
            <SpeciesPicker dispatch={dispatch} />
          )}
        </Suspense>
      </div>
    </main>
  );
}
