import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard-layout';
import { Users, Trash2 } from 'lucide-react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Button from '../components/ui/button';
import {
  Home,
  UserCog,
  Package,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from 'lucide-react';
const navItems = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Manage Cashiers', icon: UserCog, path: '/admin/manage-cashier' },
  { name: 'Customer History', icon: Users, path: '/admin/customer-history' },
  { name: 'Inventory', icon: Package, path: '/admin/inventory' },
  { name: 'Feedback', icon: Package, path:'/admin/feedback' },
];
interface CustomerHistory {
  id: number;
  customer_name: string; // Directly provided by the backend serializer
  transaction_id: number | null; // Directly provided by the backend serializer
  purchase_date: string;
  items: { item_name: string; quantity: number }[] | string; // Allow for fallback in case items is a string
}

export default function CustomerHistory() {
  const [history, setHistory] = useState<CustomerHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchCustomerHistory();
  }, []);

  const fetchCustomerHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get<CustomerHistory[]>(`${BACKEND_URL}/api/customer-history/`);
      console.log(response.data); // Debug: Ensure correct data is being fetched
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching customer history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/customer-history/${id}/`);
      setHistory((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error('Error deleting customer history:', error);
    }
  };

  const parseItems = (items: CustomerHistory['items']) => {
    if (Array.isArray(items)) {
      return items; // Already an array of objects
    }
  
    if (typeof items === 'string') {
      const parsedItems = items.split(',').map((entry) => {
        const match = entry.trim().match(/^(.+?)\s+x(\d+)$/i);
        if (match) {
          return { item_name: match[1], quantity: parseInt(match[2], 10) };
        }
        return { item_name: entry.trim(), quantity: 1 }; // Default to quantity 1 if no match
      });
      return parsedItems;
    }
  
    return []; // Fallback for invalid data
  };

  const calculateTotalItems = (items: CustomerHistory['items']) => {
    const parsedItems = parseItems(items);
    return parsedItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <DashboardLayout 
      title="Customer History"
      navItems={navItems}
      activeNavItem="Customer History"
      setActiveNavItem={() => {}}
      userEmail="admin@example.com"
      userInitials="AD"
    >
      <div>
        <CardHeader className='text-teal-400'>
          <CardTitle>Customer Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Total Items</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading customer history...
                    </TableCell>
                  </TableRow>
                ) : history.length > 0 ? (
                  history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.customer_name || 'Unknown'}</TableCell>
                      <TableCell>{entry.transaction_id || 'N/A'}</TableCell>
                      <TableCell>{entry.purchase_date}</TableCell>
                      <TableCell>{calculateTotalItems(entry.items)}</TableCell>
                      <TableCell>
                        <ul>
                          {parseItems(entry.items).map((item, index) => (
                            <li key={index}>
                              {item.item_name}: {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteHistory(entry.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No customer history found.
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
