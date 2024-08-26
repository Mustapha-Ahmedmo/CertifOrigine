import React, { useState } from 'react';
import './ToComplete.css';

const ToComplete = () => {
  // Example data for orders
  const initialOrders = [
    { id: 1, name: 'Order 1', date: '2024-08-01' },
    { id: 2, name: 'Order 2', date: '2024-08-02' },
    { id: 3, name: 'Order 3', date: '2024-08-03' },
    { id: 4, name: 'Order 4', date: '2024-08-04' },
    { id: 5, name: 'Order 5', date: '2024-08-05' },
    { id: 6, name: 'Order 6', date: '2024-08-06' },
    { id: 7, name: 'Order 7', date: '2024-08-07' },
    { id: 8, name: 'Order 8', date: '2024-08-08' },
    { id: 9, name: 'Order 9', date: '2024-08-09' },
    { id: 10, name: 'Order 10', date: '2024-08-10' },
    { id: 11, name: 'Order 11', date: '2024-08-11' },
    { id: 12, name: 'Order 12', date: '2024-08-12' },
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

  const handleDelete = (id) => {
    console.log(`Delete order ${id}`);
    // Logic to delete the order
    setOrders(orders.filter(order => order.id !== id));
  };

  return (
    <div className="to-complete-container">
      <h2>Orders to Complete</h2>
      <ul className="to-complete-list">
        {orders.map((order) => (
          <li key={order.id} className="to-complete-item">
            <span className="order-name">{order.name}</span>
            <span className="order-date">{order.date}</span>
            <div className="order-actions">
              <button onClick={() => handleEdit(order.id)} className="edit-button">Edit</button>
              <button onClick={() => handleDelete(order.id)} className="delete-button">Delete</button>
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

export default ToComplete;
