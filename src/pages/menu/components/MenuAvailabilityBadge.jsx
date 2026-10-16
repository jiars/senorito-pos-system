import { Badge } from "@/components/ui/badge";

const MenuAvailabilityBadge = ({ availability }) => {
  if (!availability) return null;

  let colorClassName = "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
  if (availability.isAvailable) {
    colorClassName = "bg-[var(--app-color-success-surface)] text-[var(--app-color-synced)]";
  }
  if (availability.status === "Low Stock" || availability.status === "On Hold") {
    colorClassName = "bg-[var(--app-color-warning-surface)] text-[var(--app-color-text)]";
  }

  return (
    <Badge
      variant="secondary"
      aria-label={`POS availability: ${availability.status}`}
      className={`h-auto max-w-full whitespace-normal break-words py-[var(--app-space-1)] text-center text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] ${colorClassName}`}
    >
      {availability.status}
    </Badge>
  );
};

export default MenuAvailabilityBadge;
