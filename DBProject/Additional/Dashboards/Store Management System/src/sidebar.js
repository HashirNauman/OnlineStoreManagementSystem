document.addEventListener('DOMContentLoaded', function () {
    const userRole = localStorage.getItem('userRole');
    const sidebarMenu = document.getElementById('sidebarMenu');

    // Display role-specific links
    if (userRole === 'admin') {
        sidebarMenu.innerHTML = `
            <li><a href="admin.html">Admin Dashboard</a></li>
            <li><a href="customers.html">View Customers</a></li>
            <li><a href="cashiers.html">View Cashiers</a></li>
        `;
    } else if (userRole === 'cashier') {
        sidebarMenu.innerHTML = `
            <li><a href="cashier.html">Cashier Dashboard</a></li>
            <li><a href="process-orders.html">Process Orders</a></li>
        `;
    } else if (userRole === 'customer') {
        sidebarMenu.innerHTML = `
            <li><a href="customer.html">Customer Dashboard</a></li>
            <li><a href="orders.html">My Orders</a></li>
        `;
    }
});
