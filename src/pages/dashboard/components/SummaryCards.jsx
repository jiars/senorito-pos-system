import { formatCurrency } from "../../../utils/currencyFormatters";
import SummaryCards from "@/components/summary-cards/SummaryCards";

const DashboardSummaryCards = ({ metrics, isLoading }) => {
  const dashboardCards = [
    {
      id: "orders-today",
      title: "Orders Today",
      value: metrics.orderCount,
      description: "Total orders received today",
    },
    {
      id: "net-revenue",
      title: "Net Revenue",
      value: formatCurrency(metrics.totalSales),
      description: "Today's completed sales",
    },
    {
      id: "total-expense",
      title: "Total Expense",
      value: formatCurrency(metrics.totalExpenses),
      description: "Today's recorded expenses",
    },
  ];

  return <SummaryCards cards={dashboardCards} isLoading={isLoading} />;
};

export default DashboardSummaryCards;
