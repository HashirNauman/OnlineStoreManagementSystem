'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard-layout';
import axios from 'axios';
import Button from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Edit,Plus,Package, Heart, Trash2, ShoppingCart, Home, ShoppingBag, CreditCard, MessageSquare, Bell } from 'lucide-react';

interface Feedback {
  id: number;
  customer_name: string;
  item_name: string;
  feedback_text: string;
  rating: number;
}

export default function Feedback() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState<Omit<Feedback, 'id' | 'customer_name' | 'item_name'>>({
    feedback_text: '',
    rating: 0,
  });
  const [loading, setLoading] = useState(false);

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

  const handleAddFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.post<Feedback>(`${BACKEND_URL}/api/feedback/`, newFeedback);
      setFeedbacks((prevFeedbacks) => [...prevFeedbacks, response.data]);
      setNewFeedback({ feedback_text: '', rating: 0 });
    } catch (error) {
      console.error('Error adding feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id: number) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/feedback/${id}/`);
      setFeedbacks((prevFeedbacks) => prevFeedbacks.filter((feedback) => feedback.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const handleUpdateFeedback = async (id: number, updatedData: Partial<Feedback>) => {
    try {
      const response = await axios.put<Feedback>(`/api/feedback/${id}/`, updatedData);
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((feedback) => (feedback.id === id ? response.data : feedback))
      );
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/customer' },
    { name: 'Explore', icon: ShoppingBag, path: '/customer/explore' },
    { name: 'My Orders and Wishlist', icon: Heart, path: '/customer/orders-wishlist' },
    { name: 'Notifications', icon: Bell, path: '/customer/notifications' },
    { name: 'Send Feedback', icon: MessageSquare, path: '/customer/send-feedback' }
  ];
  return (
    <DashboardLayout
      title="Report Feedback"
      navItems={navItems}
      activeNavItem="Feedback"
      setActiveNavItem={() => {}}
      userEmail="admin@example.com"
      userInitials="AD"
    >
      <Card className= "bg-teal-300">
        <CardHeader className='text-gray-500'>
          <CardTitle>Feedback Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                className='bg-white text-black border-white'
                placeholder="Enter feedback"
                value={newFeedback.feedback_text}
                onChange={(e) =>
                  setNewFeedback((prev) => ({ ...prev, feedback_text: e.target.value }))
                }
              />
              <Input
                type="number"
                className='bg-white text-black border-white'
                placeholder="Rating (1-5)"
                value={newFeedback.rating}
                onChange={(e) =>
                  setNewFeedback((prev) => ({ ...prev, rating: Number(e.target.value) }))
                }
              />
              <Button
                onClick={handleAddFeedback}
                className="whitespace-nowrap bg-teal-600"
                disabled={loading}
              >
                {loading ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add Feedback</>}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-200'>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.customer_name}</TableCell>
                    <TableCell>{feedback.item_name}</TableCell>
                    <TableCell>{feedback.feedback_text}</TableCell>
                    <TableCell>{feedback.rating}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateFeedback(feedback.id, {
                              feedback_text: 'Updated Feedback',
                              rating: 5,
                            })
                          }
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFeedback(feedback.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
