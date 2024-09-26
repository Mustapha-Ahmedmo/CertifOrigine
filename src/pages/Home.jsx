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
    { id: 1, name: 'Order 3', date: '2024-08-03', price: '50.00€' },
    { id: 2, name: 'Order 4', date: '2024-08-04', price: '75.00€' },
  ];

  const returnedOrders = [
    { id: 1, name: 'Order 5', date: '2024-08-05', reason: 'Damaged product' },
    { id: 2, name: 'Order 6', date: '2024-08-06', reason: 'Incorrect item' },
  ];

  const completedOrdersThisYear = [
    { id: 1, name: 'Order 7', date: '2024-08-07' },
    { id: 2, name: 'Order 8', date: '2024-08-08' },
  ];

  // Function to handle payment action
  const handlePay = (id) => {
    console.log(`Pay order with ID: ${id}`);
  };

  // Function to handle the "Completer" action for returned orders
  const handleComplete = (id) => {
    console.log(`Complete returned order with ID: ${id}`);
  };

  const handleEdit = (id) => {
    console.log(`Edit order with ID: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete order with ID: ${id}`);
  };

  return (
    <div className="home-container">
      <h2>{t('home.dashboardOverview')}</h2>
      <div className="dashboard-grid">
        <div className="dashboard-item">
          <h3>{t('home.ordersToComplete')}</h3>
          <ul>
            {toCompleteOrders.map(order => (
              <li key={order.id} className="order-item">
                {order.name} - {order.date}
                <div className="order-actions">
                  <button onClick={() => handleEdit(order.id)} className="edit-button">
                    {t('home.edit')}
                  </button>
                  <button onClick={() => handleDelete(order.id)} className="delete-button">
                    {t('home.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/dashboard/to-complete" className="dashboard-button">{t('home.goToUncompletedOrders')}</Link>
        </div>

        <div className="dashboard-item">
          <h3>{t('home.ordersToPay')}</h3>
          <ul>
            {toPayOrders.map(order => (
              <li key={order.id} className="order-item">
                {order.name} - {order.date} - {order.price}
                <div className="order-actions">
                  <button onClick={() => handlePay(order.id)} className="pay-button">
                    {t('home.pay')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/dashboard/to-pay" className="dashboard-button">{t('home.goToOrdersToPay')}</Link>
        </div>

        <div className="dashboard-item">
          <h3>{t('home.returnedOrders')}</h3>
          <ul>
            {returnedOrders.map(order => (
              <li key={order.id} className="order-item">
                {order.name} - {order.date} - {order.reason}
                <div className="order-actions">
                  <button onClick={() => handleComplete(order.id)} className="complete-button">
                    {t('home.complete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/dashboard/returned-orders" className="dashboard-button">{t('home.goToReturnedOrders')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;