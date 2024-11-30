import React from "react";
import "./styles.css";

const CashierDashboard = () => {
    return (
        <div>
            <header>
                <div className="logo">Store Management System</div>
                <nav>
                    <a href="/">Home</a>
                </nav>
            </header>

            <div className="sidebar">
                <ul>
                    <li><a href="/cashier">Cashier Dashboard</a></li>
                    <li><a href="#">Manage Transactions</a></li>
                    <li><a href="#">Customer Assistance</a></li>
                </ul>
            </div>

            <main>
                <section id="cashier-dashboard">
                    <h1>Cashier Dashboard</h1>

                    <div className="dashboard-card">
                        <h2>Manage Transactions</h2>
                        <p>Record and manage customer transactions.</p>
                        <button className="role-button cashier">Manage Transactions</button>
                    </div>

                    <div className="dashboard-card">
                        <h2>Customer Assistance</h2>
                        <p>Assist customers with inquiries and issues.</p>
                        <button className="role-button cashier">Assist Customers</button>
                    </div>
                </section>
            </main>

            <footer>
                &copy; 2024 Store Management System. All Rights Reserved.
            </footer>
        </div>
    );
};

export default CashierDashboard;
