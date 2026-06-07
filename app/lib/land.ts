// Display labels for land_type values, shared across landing pages.
export const LAND_TYPE_LABELS: Record<string, string> = {
  agri_land: "Agricultural land",
  irrigated_farmland: "Irrigated farmland",
  dryland: "Dryland",
  orchard: "Orchards",
  plantation: "Plantations",
  farmhouse_land: "Farmhouse land",
  built_farmhouse: "Built farmhouses",
  na_converted: "NA-converted land",
  developed_rural_plot: "Developed rural plots",
  other: "Land",
};

export const landLabel = (type: string) => LAND_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
