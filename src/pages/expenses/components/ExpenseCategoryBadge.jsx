import { Badge } from "@/components/ui/badge";

const ExpenseCategoryBadge = ({ categoryName, categoryColor }) => {
  const badgeStyle = {
    backgroundColor: `color-mix(in srgb, ${categoryColor} 14%, white)`,
    color: `color-mix(in srgb, ${categoryColor} 78%, black)`,
  };

  return (
    <Badge
      variant="secondary"
      className="h-6 rounded-full border-0 px-2 text-[length:var(--app-font-size-caption)] font-medium"
      style={badgeStyle}
    >
      {categoryName}
    </Badge>
  );
};

export default ExpenseCategoryBadge;
