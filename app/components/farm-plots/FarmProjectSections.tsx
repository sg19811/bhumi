import { isProjectType } from "@/app/lib/farm-plots/types";
import ProjectOverviewCard from "@/app/components/farm-plots/ProjectOverviewCard";
import ProjectTransparency from "@/app/components/farm-plots/ProjectTransparency";
import PlotInventoryTable from "@/app/components/farm-plots/PlotInventoryTable";
import AmenitiesGrid from "@/app/components/farm-plots/AmenitiesGrid";
import DeveloperProfileCard from "@/app/components/farm-plots/DeveloperProfileCard";
import TotalCostCalculator from "@/app/components/farm-plots/TotalCostCalculator";
import type { MaintenancePeriod, PlotSizeUnit } from "@/app/lib/farm-plots/types";
import { getProjectsByDeveloper } from "@/app/lib/farm-plots/queries";

// Conditional farm-project block for the listing detail page. Renders nothing for
// non-project listings, so it's safe to mount unconditionally. All field reads are
// null-safe; PlotInventoryTable handles the not-yet-migrated table gracefully.
export default async function FarmProjectSections({ listing }: { listing: Record<string, unknown> }) {
  if (!isProjectType(listing?.land_type as string | undefined)) return null;

  const amenities = Array.isArray(listing?.amenities) ? (listing.amenities as string[]) : [];
  const developerName = (listing?.developer_name as string | undefined) || null;
  const otherProjects = developerName
    ? await getProjectsByDeveloper(developerName, String(listing.id), 6)
    : [];

  return (
    <div>
      <ProjectOverviewCard listing={listing} />
      <ProjectTransparency listing={listing} />
      <PlotInventoryTable listingId={String(listing.id)} />
      <AmenitiesGrid amenities={amenities} />
      <TotalCostCalculator
        plotPrice={typeof listing?.price === "number" ? listing.price : undefined}
        maintenanceFeeAmount={typeof listing?.maintenance_fee_amount === "number" ? listing.maintenance_fee_amount : undefined}
        maintenanceFeePeriod={listing?.maintenance_fee_period as MaintenancePeriod | undefined}
        plotSizeValue={typeof listing?.plot_size_min_value === "number" ? listing.plot_size_min_value : undefined}
        plotSizeUnit={listing?.plot_size_unit as PlotSizeUnit | undefined}
      />
      <DeveloperProfileCard
        developerName={developerName}
        contactPhone={listing?.contact_phone as string | undefined}
        otherProjects={otherProjects}
      />
    </div>
  );
}
