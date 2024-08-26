import React, { useState } from 'react';
import './CompletedOrdersThisYear.css';

const CompletedOrdersThisYear = () => {
  const currentYear = new Date().getFullYear();
  
  // Example data for completed orders this year
  const initialOrders = [
    { id: 1, name: 'Order 1', date: `${currentYear}-01-15` },
    { id: 2, name: 'Order 2', date: `${currentYear}-02-20` },
    { id: 3, name: 'Order 3', date: `${currentYear}-03-10` },
    { id: 4, name: 'Order 4', date: `${currentYear}-04-05` },
    { id: 5, name: 'Order 5', date: `${currentYear}-05-25` },
    { id: 6, name: 'Order 6', date: `${currentYear}-06-30` },
    { id: 7, name: 'Order 7', date: `${currentYear}-07-15` },
    { id: 8, name: 'Order 8', date: `${currentYear}-08-08` },
    { id: 9, name: 'Order 9', date: `${currentYear}-09-12` },
    { id: 10, name: 'Order 10', date: `${currentYear}-10-01` },
    { id: 11, name: 'Order 11', date: `${currentYear}-11-05` },
    { id: 12, name: 'Order 12', date: `${currentYear}-12-15` },
  ];

  const [orders, setOrders] = useState(initialOrders.slice(0, 10));
  const [showMore, setShowMore] = useState(false);

  const handleShowMore = () => {
    setShowMore(true);
    setOrders(initialOrders);
  };

  return (
    <div className="completed-orders-container">
      <h2>Orders Completed This Year</h2>
      <ul className="completed-orders-list">
        {orders.map((order) => (
          <li key={order.id} className="completed-orders-item">
            <span className="order-name">{order.name}</span>
            <span className="order-date">{order.date}</span>
          </li>
        ))}
      </ul>
      {!showMore && initialOrders.length > 10 && (
        <button onClick={handleShowMore} className="show-more-button">Show more</button>
      )}
    </div>
  );
};

export default CompletedOrdersThisYear;
