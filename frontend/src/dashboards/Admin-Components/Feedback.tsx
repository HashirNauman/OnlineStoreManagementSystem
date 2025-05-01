import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard-layout';
import { MessageSquare, Trash2 } from 'lucide-react';
import axios from 'axios';
import Button from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Users,
  Home,
  UserCog,
  Package,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from 'lucide-react';
interface Feedback {
  id: number;
  customer_name: string;
  item_name: string;
  feedback_text: string;
  rating: number;
}
const navItems = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Manage Cashiers', icon: UserCog, path: '/admin/manage-cashier' },
  { name: 'Customer History', icon: Users, path: '/admin/customer-history' },
  { name: 'Inventory', icon: Package, path: '/admin/inventory' },
  { name: 'Feedback', icon: Package, path:'/admin/feedback' },
];
export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Feedback[]>(`${BACKEND_URL}/api/feedback/`);
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id: number) => {
    setDeleting(id);
    try {
      await axios.delete(`${BACKEND_URL}/api/feedback/${id}/`);
      setFeedbacks((prevFeedbacks) => prevFeedbacks.filter((feedback) => feedback.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <DashboardLayout
      title="Feedback Management"
      navItems={navItems}
      activeNavItem="Feedback"
      setActiveNavItem={() => {}}
      userEmail="admin@example.com"
      userInitials="AD"
    >
      <div>
        <CardHeader className='text-teal-400'>
          <CardTitle>Feedback Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading feedbacks...
                    </TableCell>
                  </TableRow>
                ) : feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>{feedback.customer_name}</TableCell>
                      <TableCell>{feedback.item_name}</TableCell>
                      <TableCell>{feedback.feedback_text}</TableCell>
                      <TableCell>{feedback.rating}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            disabled={deleting === feedback.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deleting === feedback.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No feedback found.
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
