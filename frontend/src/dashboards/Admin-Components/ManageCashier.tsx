'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard-layout';
import { Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import Button from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Home,
  UserCog,
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from 'lucide-react';
interface Cashier {
  id: number;
  user_name: string; // Matches user__name in API response
  user_email: string; // Matches user__email in API response
  user_phone: string; // Matches user__phone in API response
  shift_start_time: string; // Matches shift_start_time in API response
  shift_end_time: string; // Matches shift_end_time in API response
}
const navItems = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Manage Cashiers', icon: UserCog, path: '/admin/manage-cashier' },
  { name: 'Customer History', icon: Users, path: '/admin/customer-history' },
  { name: 'Inventory', icon: Package, path: '/admin/inventory' },
  { name: 'Feedback', icon: Package, path:'/admin/feedback' },
];
export default function ManageCashiers() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [newCashier, setNewCashier] = useState<Omit<Cashier, 'id'>>({
    user_name: '',
    user_email: '',
    user_phone: '',
    shift_start_time: '',
    shift_end_time: '',
  });
  const [editableCashier, setEditableCashier] = useState<Partial<Cashier> | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<any[]>(`${BACKEND_URL}/api/cashiers/`);
      console.log('API Response:', response.data);
  
      const cashiers = response.data.map((cashier) => ({
        id: cashier.id, // Access nested `user` object for `id`
        user_name: cashier.user.name,
        user_email: cashier.user.email,
        user_phone: cashier.user.phone,
        shift_start_time: cashier.shift_start_time,
        shift_end_time: cashier.shift_end_time,
      }));
  
      setCashiers(cashiers);
    } catch (error) {
      console.error('Error fetching cashiers:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddCashier = async () => {
    if (!newCashier.user_name || !newCashier.user_email || !newCashier.user_phone) {
      alert('Please fill in all required fields.');
      return;
    }
  
    setAdding(true);
    try {
      const cashierData = {
        user: {
          name: newCashier.user_name,
          email: newCashier.user_email,
          phone: newCashier.user_phone,
          role: 'Cashier',
        },
        shift_start_time: newCashier.shift_start_time,
        shift_end_time: newCashier.shift_end_time,
      };
  
      const response = await axios.post<Cashier>(`${BACKEND_URL}/api/cashiers/`, cashierData);
      setCashiers((prevCashiers) => [
        ...prevCashiers,
        response.data,
      ]);
      setNewCashier({ user_name: '', user_email: '', user_phone: '', shift_start_time: '', shift_end_time: '' });
    } catch (error) {
      console.error('Error adding cashier:', error);
    } finally {
      setAdding(false);
    }
  };
  const handleUpdateCashier = async (id: number, updatedData: Partial<Cashier>) => {
    try {
      const updatedPayload = {
        user: {
          name: updatedData.user_name || '',
          email: updatedData.user_email || '',
          phone: updatedData.user_phone || '',
          role: 'Cashier', // Ensure the role is sent, if required
        },
        shift_start_time: updatedData.shift_start_time || '00:00:00',
        shift_end_time: updatedData.shift_end_time || '12:00:00',
      };
  
      const response = await axios.put<Cashier>(`${BACKEND_URL}/api/cashiers/${id}/`, updatedPayload);
  
      setCashiers((prevCashiers) =>
        prevCashiers.map((cashier) =>
          cashier.id === id ? { ...cashier, ...response.data } : cashier
        )
      );
      setIsEditing(false);
      setEditableCashier(null);
    } catch (error) {
      console.error('Error updating cashier:', error);
    }
  };
  
  const handleDeleteCashier = async (id: number) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/cashiers/${id}/`);
      setCashiers((prevCashiers) => prevCashiers.filter((cashier) => cashier.id !== id));
    } catch (error) {
      console.error('Error deleting cashier:', error);
    }
  };

  const handleEditClick = (cashier: Cashier) => {
    setEditableCashier({ ...cashier });
    setIsEditing(!isEditing);
  };

  return (
    <DashboardLayout
      title="Manage Cashiers"
      navItems={navItems}
      activeNavItem="Manage Cashiers"
      setActiveNavItem={() => {}}
      userEmail="admin@example.com"
      userInitials="AD"
    >
      <div>
        <CardHeader className='text-teal-400'>
          <CardTitle>Manage Cashiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p>Loading cashiers...</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-4 fill-white">
                  <Input className="bg-gray-300 text-black border-white"
                    type="text"
                    placeholder="Name"
                    value={newCashier.user_name}
                    onChange={(e) =>
                      setNewCashier((prev) => ({ ...prev, user_name: e.target.value }))
                    }
                  />
                  <Input className="bg-gray-300 text-black border-white"
                    type="email"
                    placeholder="Email"
                    value={newCashier.user_email}
                    onChange={(e) =>
                      setNewCashier((prev) => ({ ...prev, user_email: e.target.value }))
                    }
                  />
                  <Input className="bg-gray-300 text-black border-white"
                    type="tel"
                    placeholder="Phone"
                    value={newCashier.user_phone}
                    onChange={(e) =>
                      setNewCashier((prev) => ({ ...prev, user_phone: e.target.value }))
                    }
                  />
                  <Input className="bg-gray-300 text-black border-white"
                    type="time"
                    placeholder="Shift Start Time"
                    value={newCashier.shift_start_time}
                    onChange={(e) =>
                      setNewCashier((prev) => ({ ...prev, shift_start_time: e.target.value }))
                    }
                  />
                  <Input className="bg-gray-300 text-black border-white"
                    type="time"
                    placeholder="Shift End Time"
                    value={newCashier.shift_end_time}
                    onChange={(e) =>
                      setNewCashier((prev) => ({ ...prev, shift_end_time: e.target.value }))
                    }
                  />
                  <Button className='bg-green-700 hover:bg-green-500' onClick={handleAddCashier} disabled={adding}>
                    {adding ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add Cashier</>}
                  </Button>
                </div>

                <Table>
                  <TableHeader className='bg-teal-300'>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Shift Start</TableHead>
                      <TableHead>Shift End</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashiers.length > 0 ? (
                      cashiers.map((cashier) => (
                        <TableRow key={cashier.id}>
                          <TableCell>{cashier.user_name}</TableCell>
                          <TableCell>{cashier.user_email}</TableCell>
                          <TableCell>{cashier.user_phone}</TableCell>
                          <TableCell>{cashier.shift_start_time}</TableCell>
                          <TableCell>{cashier.shift_end_time}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button className='bg-yellow-200'
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(cashier)}
                              >
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCashier(cashier.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No cashiers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {isEditing && editableCashier && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold">Edit Cashier</h3>
                    <div className="space-y-4">
                      <Input
                        className='bg-gray-300'
                        type="text"
                        placeholder="Name"
                        value={editableCashier.user_name || ''}
                        onChange={(e) =>
                          setEditableCashier({ ...editableCashier, user_name: e.target.value })
                        }
                      />
                      <Input
                        className='bg-gray-300'
                        type="email"
                        placeholder="Email"
                        value={editableCashier.user_email || ''}
                        onChange={(e) =>
                          setEditableCashier({ ...editableCashier, user_email: e.target.value })
                        }
                      />
                      <Input
                      className='bg-gray-300'
                        type="tel"
                        placeholder="Phone"
                        value={editableCashier.user_phone || ''}
                        onChange={(e) =>
                          setEditableCashier({ ...editableCashier, user_phone: e.target.value })
                        }
                      />
                      <Input
                        className='bg-gray-300'
                        type="time"
                        value={editableCashier.shift_start_time || ''}
                        onChange={(e) =>
                          setEditableCashier({
                            ...editableCashier,
                            shift_start_time: e.target.value,
                          })
                        }
                      />
                      <Input
                        className='bg-gray-300'
                        type="time"
                        value={editableCashier.shift_end_time || ''}
                        onChange={(e) =>
                          setEditableCashier({
                            ...editableCashier,
                            shift_end_time: e.target.value,
                          })
                        }
                      />
                      <Button
                        onClick={() => handleUpdateCashier(editableCashier.id!, editableCashier)}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </div>
    </DashboardLayout>
  );
}
