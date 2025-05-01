'use client';

import React, { useEffect, useState } from 'react';
import Button from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import DashboardLayout from './components/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Home, Package, DollarSign, CreditCard, Bell } from 'lucide-react';

type OrderItem = {
  id: number;
  item: {
    name: string;
  };
  quantity: number;
};

type Order = {
  id: number;
  customer: string;
  order_items: OrderItem[];
  total_amount: string;
  status: string; // "Completed" or "Pending"
};

type NavItem = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
};

export default function CashierDashboard() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const [activeNavItem, setActiveNavItem] = useState<string>('Dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'Completed' | 'Pending'>('Completed'); // Added status filter

  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: Home, path: '/cashier' },
    { name: 'Inventory', icon: Package, path: '/cashier/inventory' },
    { name: 'Notify User', icon: Bell, path: 'cashier/notify_user' },
  ];

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/orderslist`);
        const data: Order[] = await response.json();
        setOrders(data);

        const revenue = data.reduce((acc, order) => acc + parseFloat(order.total_amount), 0);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleResetRevenue = () => {
    setTotalRevenue(0);
  };

  // Filter orders based on the selected status
  const filteredOrders = orders.filter(order => order.status === statusFilter);

  return (
    <DashboardLayout
      title="Cashier Dashboard"
      navItems={navItems}
      activeNavItem={activeNavItem}
      setActiveNavItem={setActiveNavItem}
      userEmail="cashier@example.com"
      userInitials="C"
    >
      <div>
        <CardHeader className="text-teal-400">
          <CardTitle>Orders Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Total Revenue: ${totalRevenue.toFixed(2)}</h2>
            <Button variant="destructive" onClick={handleResetRevenue}>
              Reset Revenue
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="mb-4">
            <Button
            variant={statusFilter === 'Completed' ? 'ghost' : 'outline'}
            onClick={() => setStatusFilter('Completed')}
            >
            Completed Orders
            </Button>
            <Button
            variant={statusFilter === 'Pending' ? 'ghost' : 'outline'}
            onClick={() => setStatusFilter('Pending')}
            >
            Pending Orders
            </Button>
          </div>

          {/* Orders Table */}
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <ul>
                          {order.order_items.map((item) => (
                            <li key={item.id}>
                              {item.quantity} x {item.item.name}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No orders available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>
    </DashboardLayout>
  );
}
