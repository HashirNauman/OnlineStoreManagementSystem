'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import Button from "./components/ui/button";
import { Home,Bell, ShoppingBag, CreditCard, Heart, Package, MessageSquare } from 'lucide-react';
import DashboardLayout from './components/dashboard-layout';

// Define types for the data
interface Order {
  id: string;
  items: { item_name: string, quantity: number, image_url: string }[];
  status: string;
  order_date: string;
  total_amount: string;
}

interface LoyaltyProgress {
  points: number;
  tier: string;
  progress: number;
}

interface Product {
  image: string;
  item_name: string;
  price: string;
}

interface DashboardData {
  totalSpent: number;
  ordersPlaced: number;
  wishlistItems: number;
  points: number;
  recentOrders: Order[];
  loyaltyProgress: LoyaltyProgress;
  recommendedProducts: Product[];
}

export default function CustomerDashboard() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
  const customerId = '1';
  const [activeNavItem, setActiveNavItem] = useState('Dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSpent: 0,
    ordersPlaced: 0,
    wishlistItems: 0,
    points: 0,
    recentOrders: [],
    loyaltyProgress: { points: 0, tier: 'Bronze', progress: 0 },
    recommendedProducts: []
  });

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/customer' },
    { name: 'Explore', icon: ShoppingBag, path: '/customer/explore' },
    { name: 'My Orders and Wishlist', icon: Heart, path: '/customer/orders-wishlist' },
    { name: 'Notifications', icon: Bell, path: '/customer/notifications' },
    { name: 'Send Feedback', icon: MessageSquare, path: '/customer/send-feedback' }
  ];

  useEffect(() => {
    // Fetch data from the Django API
    async function fetchDashboardData() {
      try {
        const responses = await Promise.all([
          fetch(`${BACKEND_URL}/api/orders/total-spent/?customer_id=${customerId}`),
          fetch(`${BACKEND_URL}/api/orders/count/?customer_id=${customerId}`),
          fetch(`${BACKEND_URL}/api/wishlist/count/?customer_id=${customerId}`),
          fetch(`${BACKEND_URL}/api/loyalty-points/?customer_id=${customerId}`),
          fetch(`${BACKEND_URL}/api/orders/recent/?customer_id=${customerId}`),
          fetch(`${BACKEND_URL}/api/loyalty-progress/?customer_id=${customerId}`),
          fetch(`${BACKEND_URL}/api/recommended-products/?customer_id=${customerId}`)
        ]);

        // Check if all responses are OK before parsing
        const data = await Promise.all(
          responses.map((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch ${res.url}: ${res.status}`);
            }
            return res.json();
          })
        );
        setDashboardData({
          totalSpent: data[0].total_spent,
          ordersPlaced: data[1].order_count,
          wishlistItems: data[2].wishlist_count,
          points: data[3].points,
          recentOrders: data[4],
          loyaltyProgress: data[5],
          recommendedProducts: data[6]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout
      title="Customer Dashboard"
      navItems={navItems}
      activeNavItem={activeNavItem}
      setActiveNavItem={setActiveNavItem}
      userEmail="john.doe@example.com"
      userInitials="JD"
    >
      {/* Key Metrics Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md bg-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-green-600 ">
            <CardTitle className="text-lg font-semibold   ">Total Spent</CardTitle>
            <CreditCard className="h-8 w-8 " />
          </CardHeader>
          <CardContent>
            <div className="  text-2xl font-bold text-green-600">${dashboardData.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-purple-600">
            <CardTitle className="text-sm font-medium text-blue-700">Orders Placed</CardTitle>
            <ShoppingBag className="h-8 w-8 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{dashboardData.ordersPlaced}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-red-600">
            <CardTitle className="text-sm font-medium text-red-600">Wishlist Items</CardTitle>
            <Heart className="h-8 w-8 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.wishlistItems}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-yellow-600">
            <CardTitle className="text-sm font-medium text-yellow-600">Loyalty Points</CardTitle>
            <Package className="h-8 w-8 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{dashboardData.loyaltyProgress.points}</div>
          </CardContent>
        </Card>
      </div>

      {/* Order History and Loyalty Progress Section */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Recent Order History */}
        <Card className="shadow-md bg-gray-300" >
          <CardHeader className='text-purple-800'>
            <CardTitle className="text-lg font-semibold ">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="space-y-1 hover:bg-gray-100 ">
                    {/* Map over items and display item details */}
                    {order.items.map((item, index) => (
                      <div key={index}>
                        <p className="text-lg font-medium text-purple-800">{item.item_name} (x{item.quantity})</p>
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-16 h-16 object-cover mb-2"
                        />
                      </div>
                    ))}
                    <p className="text-sm text-muted-foreground text-sky-900">
                      Order ID: {order.id} • {order.status} • {order.order_date} • ${order.total_amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Program Progress */}
        <Card className="shadow-md bg-gray-300">
          <CardHeader className='text-yellow-700'>
            <CardTitle className="text-lg font-semibold ">Loyalty Program Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium text-yellow-700">
                    {dashboardData.loyaltyProgress.points} / 500 points
                  </div>
                </div>
                {/* Progress Bar */}
                <Progress
                  value={(dashboardData.loyaltyProgress.points / 500) * 100} // Calculate percentage
                />
              </div>
              <p className="text-sm text-muted-foreground text-yellow-700">
                You're {500 - dashboardData.loyaltyProgress.points} points away from reaching Gold Tier and unlocking exclusive rewards!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      
    </DashboardLayout>
  );
}
