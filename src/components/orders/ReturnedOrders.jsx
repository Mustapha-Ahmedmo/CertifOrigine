import React, { useState } from 'react';
import './ReturnedOrders.css';

const ReturnedOrders = () => {
  const initialOrders = [
    { id: 1, name: 'Order 1', date: '2024-08-01', reason: 'Damaged product' },
    { id: 2, name: 'Order 2', date: '2024-08-02', reason: 'Incorrect item shipped' },
    { id: 3, name: 'Order 3', date: '2024-08-03', reason: 'Customer changed mind' },
    { id: 4, name: 'Order 4', date: '2024-08-04', reason: 'Late delivery' },
    { id: 5, name: 'Order 5', date: '2024-08-05', reason: 'Product not as described' },
    { id: 6, name: 'Order 6', date: '2024-08-06', reason: 'Product was defective' },
    { id: 7, name: 'Order 7', date: '2024-08-07', reason: 'Ordered by mistake' },
    { id: 8, name: 'Order 8', date: '2024-08-08', reason: 'Better price found elsewhere' },
    { id: 9, name: 'Order 9', date: '2024-08-09', reason: 'Item arrived too late' },
    { id: 10, name: 'Order 10', date: '2024-08-10', reason: 'Wrong size/color' },
    { id: 11, name: 'Order 11', date: '2024-08-11', reason: 'Product not needed anymore' },
    { id: 12, name: 'Order 12', date: '2024-08-12', reason: 'Duplicate order' },
  ];

  const [orders, setOrders] = useState(initialOrders.slice(0, 10));
  const [showMore, setShowMore] = useState(false);

  const handleShowMore = () => {
    setShowMore(true);
    setOrders(initialOrders);
  };

  const handleEdit = (id) => {
    console.log(`Edit order ${id}`);
    // Logic to edit the order
  };

  return (
    <div className="returned-orders-container">
      <h2>Returned Orders</h2>
      <ul className="returned-orders-list">
        {orders.map((order) => (
          <li key={order.id} className="returned-orders-item">
            <span className="order-name">{order.name}</span>
            <span className="order-date">{order.date}</span>
            <div className="order-actions">
              <div className="info-icon">
                i
                <span className="tooltip">{order.reason}</span>
              </div>
              <button onClick={() => handleEdit(order.id)} className="edit-button">Edit</button>
            </div>
          </li>
        ))}
      </ul>
      {!showMore && initialOrders.length > 10 && (
        <button onClick={handleShowMore} className="show-more-button">Show more</button>
      )}
    </div>
  );
};

export default ReturnedOrders;
