import { useLayoutEffect, useRef, useState } from "react";

const getMetricValueParts = (value) => {
  const displayValue = String(value);
  const decimalIndex = displayValue.lastIndexOf(".");

  return decimalIndex === -1
    ? { whole: displayValue, decimal: "" }
    : {
        whole: displayValue.slice(0, decimalIndex),
        decimal: displayValue.slice(decimalIndex),
      };
};

/** Fits a monetary or numeric metric within its immediate parent container. */
const ResponsiveMetricValue = ({
  value,
  maxFontSize = 32,
  minFontSize = 20,
  decimalFontSize,
  className = "",
  decimalClassName = "",
}) => {
  const valueRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize);
  const { whole, decimal } = getMetricValueParts(value);

  useLayoutEffect(() => {
    const valueElement = valueRef.current;

    if (!valueElement) return undefined;

    const fitValue = () => {
      let nextFontSize = maxFontSize;
      valueElement.style.fontSize = `${nextFontSize}px`;

      while (
        valueElement.scrollWidth > valueElement.clientWidth &&
        nextFontSize > minFontSize
      ) {
        nextFontSize -= 1;
        valueElement.style.fontSize = `${nextFontSize}px`;
      }

      setFontSize(nextFontSize);
    };

    fitValue();

    const resizeObserver = new ResizeObserver(fitValue);
    resizeObserver.observe(valueElement.parentElement);

    return () => resizeObserver.disconnect();
  }, [whole, decimal, maxFontSize, minFontSize]);

  const resolvedDecimalFontSize =
    decimalFontSize ?? Math.round(fontSize * 0.625);

  return (
    <p
      ref={valueRef}
      className={`max-w-full whitespace-nowrap leading-[var(--app-line-height-h1)] font-bold tracking-tight text-[var(--app-color-text)] ${className}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {whole}
      {decimal && (
        <span
          className={`font-medium text-[var(--app-color-text-muted)] ${decimalClassName}`}
          style={{ fontSize: `${resolvedDecimalFontSize}px` }}
        >
          {decimal}
        </span>
      )}
    </p>
  );
};

export default ResponsiveMetricValue;
