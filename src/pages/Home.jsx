import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  // Example data for each section (just a few orders)
  const toCompleteOrders = [
    { id: 1, name: 'Order 1', date: '2024-08-01' },
    { id: 2, name: 'Order 2', date: '2024-08-02' },
  ];

  const toPayOrders = [
    { id: 1, name: 'Order 3', date: '2024-08-03' },
    { id: 2, name: 'Order 4', date: '2024-08-04' },
  ];

  const returnedOrders = [
    { id: 1, name: 'Order 5', date: '2024-08-05', reason: 'Damaged product' },
    { id: 2, name: 'Order 6', date: '2024-08-06', reason: 'Incorrect item' },
  ];

  const completedOrdersThisYear = [
    { id: 1, name: 'Order 7', date: '2024-08-07' },
    { id: 2, name: 'Order 8', date: '2024-08-08' },
  ];

  return (
    <div className="home-container">
      <h2>Dashboard Overview</h2>
      <div className="dashboard-grid">
        <div className="dashboard-item">
          <h3>Orders to Complete</h3>
          <ul>
            {toCompleteOrders.map(order => (
              <li key={order.id}>
                {order.name} - {order.date}
              </li>
            ))}
          </ul>
          <Link to="/to-complete" className="dashboard-button">Go to Uncompleted Orders</Link>
        </div>
        
        <div className="dashboard-item">
          <h3>Orders to Pay</h3>
          <ul>
            {toPayOrders.map(order => (
              <li key={order.id}>
                {order.name} - {order.date}
              </li>
            ))}
          </ul>
          <Link to="/to-pay" className="dashboard-button">Go to Orders to Pay</Link>
        </div>
        
        <div className="dashboard-item">
          <h3>Returned Orders</h3>
          <ul>
            {returnedOrders.map(order => (
              <li key={order.id}>
                {order.name} - {order.date}
              </li>
            ))}
          </ul>
          <Link to="/returned-orders" className="dashboard-button">Go to Returned Orders</Link>
        </div>
        
        <div className="dashboard-item">
          <h3>Completed Orders This Year</h3>
          <ul>
            {completedOrdersThisYear.map(order => (
              <li key={order.id}>
                {order.name} - {order.date}
              </li>
            ))}
          </ul>
          <Link to="/completed-orders-this-year" className="dashboard-button">Go to Completed Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
