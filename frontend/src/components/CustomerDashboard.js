import React from "react";
import "./styles.css";

const CustomerDashboard = () => {
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
                    <li><a href="/customer">Customer Dashboard</a></li>
                    <li><a href="#">View Products</a></li>
                    <li><a href="#">Purchase History</a></li>
                </ul>
            </div>

            <main>
                <section id="customer-dashboard">
                    <h1>Customer Dashboard</h1>

                    <div className="dashboard-card">
                        <h2>View Products</h2>
                        <p>Explore the list of available products.</p>
                        <button className="role-button customer">View Products</button>
                    </div>

                    <div className="dashboard-card">
                        <h2>Purchase History</h2>
                        <p>Review your previous purchases.</p>
                        <button className="role-button customer">View History</button>
                    </div>
                </section>
            </main>

            <footer>
                &copy; 2024 Store Management System. All Rights Reserved.
            </footer>
        </div>
    );
};

export default CustomerDashboard;
