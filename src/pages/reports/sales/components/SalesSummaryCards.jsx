import React from 'react';

const SalesSummaryCards = ({ summaryCards }) => {
  return (
    <div className="sales-summary-cards">
      {summaryCards.map((card) => (
        <div
          key={card.id}
          className={`sales-summary-card sales-card--${card.color}`}
        >
          <div className="sales-summary-card-icon">
            <i className={`bi ${card.icon}`}></i>
          </div>
          <p className="sales-summary-card-value">{card.value}</p>
          <p className="sales-summary-card-label">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default SalesSummaryCards;
