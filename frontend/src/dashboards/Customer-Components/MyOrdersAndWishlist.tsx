import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Button from "../components/ui/button";
import { Package, Heart, Trash2,Bell, ShoppingCart, Home, ShoppingBag, CreditCard, MessageSquare } from 'lucide-react';
import DashboardLayout from '../components/dashboard-layout';

interface Order {
  id: number;
  items: {
    item_name: string;
    quantity: number;
    image_url: string;
  }[];
  status: string;
  order_date: string;
  total_amount: number;
}

interface WishlistItem {
  id: number;
  item_name: string;
  price: number;
  image_url: string;
}

export default function MyOrdersAndWishlist() {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [activeOrderState, setActiveOrderState] = useState<'Pending' | 'Completed'>('Pending');  // New state for order status
  const [activeNavItem, setActiveNavItem] = useState('My Orders and Wishlist');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    // Fetch orders and wishlist items from the backend
    fetch(`${BACKEND_URL}/api/orders/`)
      .then(response => response.json())
      .then(data => setOrders(data))
      .catch(error => console.error('Error fetching orders:', error));

    fetch(`${BACKEND_URL}/api/wishlist/`)
      .then(response => response.json())
      .then(data => setWishlist(data))
      .catch(error => console.error('Error fetching wishlist:', error));
  }, []);

  const removeFromWishlist = (itemId: number) => {
    fetch(`${BACKEND_URL}/api/wishlist/${itemId}/`, {
      method: 'DELETE',
    })
      .then(() => {
        setWishlist(wishlist.filter(item => item.id !== itemId));
      })
      .catch(error => console.error('Error removing from wishlist:', error));
  };

  const markAsCompleted = (orderId: number) => {
    fetch(`${BACKEND_URL}/api/orders/${orderId}/mark_completed/`, {
      method: 'PATCH',
    })
      .then(response => response.json())
      .then(updatedOrder => {
        setOrders(orders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
      })
      .catch(error => console.error('Error updating order status:', error));
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/customer' },
    { name: 'Explore', icon: ShoppingBag, path: '/customer/explore' },
    { name: 'My Orders and Wishlist', icon: Heart, path: '/customer/orders-wishlist' },
    { name: 'Notifications', icon: Bell, path: '/customer/notifications' },
    { name: 'Send Feedback', icon: MessageSquare, path: '/customer/send-feedback' }
  ];

  const pendingOrders = orders.filter(order => order.status === 'Pending');
  const completedOrders = orders.filter(order => order.status === 'Completed');

  return (
    <DashboardLayout
      title="My Orders and Wishlist"
      navItems={navItems}
      activeNavItem={activeNavItem}
      setActiveNavItem={setActiveNavItem}
      userEmail="john.doe@example.com"
      userInitials="JD"
    >
      <div className="mb-6">
        <Button
          onClick={() => setActiveTab('orders')}
          variant={activeTab === 'orders' ? 'primary' : 'ghost'}
          className="mr-0"
        >
          <Package className="mr-2 h-4 w-4" /> My Orders
        </Button>
        <Button
          onClick={() => setActiveTab('wishlist')}
          variant={activeTab === 'wishlist' ? 'primary' : 'ghost'}
        >
          <Heart className="mr-2 h-4 w-4" /> Wishlist
        </Button>
      </div>

      {activeTab === 'orders' && (
        <div>
          <div className="mb-4">
            <Button
                onClick={() => setActiveOrderState('Pending')}
                variant={activeOrderState === 'Pending' ? 'primary' : 'ghost'}
                className={`${activeOrderState === 'Pending' ? 'bg-red-500 text-white ' : ''}`}>
                Pending
            </Button>
            <Button
            onClick={() => setActiveOrderState('Completed')}
            variant={activeOrderState === 'Completed' ? 'primary' : 'ghost'}
            className={`${activeOrderState === 'Completed' ? 'bg-green-700 text-white' : ''}`}
            >
            Completed
            </Button>
          </div>

          <h3>{activeOrderState} Orders</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(activeOrderState === 'Pending' ? pendingOrders : completedOrders).map((order) => (
              <Card key={order.id} className="shadow-md bg-teal-200">
                <CardHeader className='text-gray-500'>
                  <CardTitle >Order #{order.id}</CardTitle>
                </CardHeader>
                <CardContent className='text-gray-400'>
                  {order.items.map((item, index) => (
                    <div key={index} className="mb-4 flex">
                      <img
                        src={item.image_url || "/placeholder-image.png"}
                        alt={item.item_name}
                        className="w-16 h-16 object-cover mr-6"
                      />
                      <div>
                        <h3 className="font-semibold">{item.item_name}</h3>
                        <p className='text-gray-400'>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <p className='text-gray-500'>Status: {order.status}</p>
                  <p className='text-gray-500'>Date: {order.order_date}</p>
                  <p className="text-green-500 font-bold mt-2">Total: ${Number(order.total_amount).toFixed(2)}</p>
                  {order.status === 'Pending' && (
                    <Button  onClick={() => markAsCompleted(order.id)} variant="primary" >Mark as Completed </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <Card key={item.id} className="shadow-md bg-teal-300">
              <CardContent className="flex justify-between items-center">
                {item.image_url && (
                  <img
                    src={item.image_url || "/placeholder-image.png"}
                    alt={item.item_name}
                    className="w-16 h-16 object-cover mr-4"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{item.item_name}</h3>
                  <p>${Number(item.price).toFixed(2)}</p>
                  <Button variant="destructive" onClick={() => removeFromWishlist(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
