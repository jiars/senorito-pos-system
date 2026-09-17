import { useLayoutEffect, useRef, useState } from "react";

import { formatCurrency } from "../../../utils/currencyFormatters";

const MAX_METRIC_FONT_SIZE = 32;
const MIN_METRIC_FONT_SIZE = 20;

const getMetricValueParts = (value) => {
  const displayValue = String(value);
  const decimalIndex = displayValue.lastIndexOf(".");

  if (decimalIndex === -1) {
    return {
      whole: displayValue,
      decimal: "",
    };
  }

  return {
    whole: displayValue.slice(0, decimalIndex),
    decimal: displayValue.slice(decimalIndex),
  };
};

const ResponsiveMetricValue = ({ whole, decimal }) => {
  const valueRef = useRef(null);
  const [fontSize, setFontSize] = useState(MAX_METRIC_FONT_SIZE);

  useLayoutEffect(() => {
    const valueElement = valueRef.current;

    if (!valueElement) {
      return undefined;
    }

    const fitValue = () => {
      let nextFontSize = MAX_METRIC_FONT_SIZE;
      valueElement.style.fontSize = `${nextFontSize}px`;

      while (
        valueElement.scrollWidth > valueElement.clientWidth &&
        nextFontSize > MIN_METRIC_FONT_SIZE
      ) {
        nextFontSize -= 1;
        valueElement.style.fontSize = `${nextFontSize}px`;
      }

      setFontSize(nextFontSize);
    };

    fitValue();

    const cardElement = valueElement.closest("article");
    const resizeObserver = new ResizeObserver(fitValue);

    if (cardElement) {
      resizeObserver.observe(cardElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [whole, decimal]);

  const decimalFontSize = Math.round(fontSize * 0.625);

  return (
    <p
      ref={valueRef}
      className="max-w-full whitespace-nowrap leading-[var(--app-line-height-h1)] font-bold tracking-tight text-[var(--app-color-text-main)]"
      style={{ fontSize: `${fontSize}px` }}
    >
      {whole}
      {decimal && (
        <span
          className="font-medium text-[var(--app-color-text-muted)]"
          style={{ fontSize: `${decimalFontSize}px` }}
        >
          {decimal}
        </span>
      )}
    </p>
  );
};

const SummaryCards = ({ metrics, isLoadingTop }) => {
  const summaryCards = [
    {
      id: "orders-today",
      title: "Orders Today",
      value: isLoadingTop ? "..." : metrics.orderCount,
      description: "Total orders received today",
    },
    {
      id: "net-revenue",
      title: "Net Revenue",
      value: isLoadingTop ? "..." : formatCurrency(metrics.totalSales),
      description: "Today's completed sales",
    },
    {
      id: "total-expense",
      title: "Total Expense",
      value: isLoadingTop ? "..." : formatCurrency(metrics.totalExpenses),
      description: "Today's recorded expenses",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-3">
      {summaryCards.map((card) => {
        const metricValue = getMetricValueParts(card.value);

        return (
          <article
            key={card.id}
            className="flex min-h-[132px] flex-col justify-between rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] shadow-[var(--app-shadow-card)]"
          >
            <p className="text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-normal text-[var(--app-color-text-muted)]">
              {card.title}
            </p>

            <div>
              <ResponsiveMetricValue
                whole={metricValue.whole}
                decimal={metricValue.decimal}
              />

              <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                {card.description}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default SummaryCards;
