import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();

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
      <h2>{t('home.dashboardOverview')}</h2>
      <div className="dashboard-grid">
        <div className="dashboard-item">
          <h3>{t('home.ordersToComplete')}</h3>
          <ul>
            {toCompleteOrders.map(order => (
              <li key={order.id}>
                {order.name} - {order.date}
              </li>
            ))}
          </ul>
          <Link to="/to-complete" className="dashboard-button">{t('home.goToUncompletedOrders')}</Link>
        </div>
        
        <div className="dashboard-item">
          <h3>{t('home.ordersToPay')}</h3>
          <ul>
            {toPayOrders.map(order => (
              <li key={order.id}>
                {order.name} - {order.date}
              </li>
            ))}
          </ul>
          <Link to="/to-pay" className="dashboard-button">{t('home.goToOrdersToPay')}</Link>
        </div>
        
        <div className="dashboard-item">
          <h3>{t('home.returnedOrders')}</h3>
          <ul>
            {returnedOrders.map(order => (
              <li key={order.id}>
                {order.name} - {order.date}
              </li>
            ))}
          </ul>
          <Link to="/returned-orders" className="dashboard-button">{t('home.goToReturnedOrders')}</Link>
        </div>
        
        <div className="dashboard-item">
          <h3>{t('home.completedOrdersThisYear')}</h3>
          <ul>
            {completedOrdersThisYear.map(order => (
              <li key={order.id}>
                {order.name} - {order.date}
              </li>
            ))}
          </ul>
          <Link to="/completed-orders-this-year" className="dashboard-button">{t('home.goToCompletedOrders')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;