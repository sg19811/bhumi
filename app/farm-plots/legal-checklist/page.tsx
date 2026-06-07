import { redirect } from "next/navigation";

// Farm-plot legal checklist → the existing legal checklist (don't duplicate legal content).
export default function FarmPlotLegalChecklist() {
  redirect("/legal/checklist");
}
