import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import DashboardLayout from "../components/dashboard-layout";
import { Package, Heart, Trash2, ShoppingCart,Bell, Home, ShoppingBag, CreditCard, MessageSquare } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  date: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const customerId = "1"; // Replace with the actual customer ID (e.g., fetched from context or local storage)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/notifications/?customer_id=${customerId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    fetchNotifications();
  }, []);
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/customer' },
    { name: 'Explore', icon: ShoppingBag, path: '/customer/explore' },
    { name: 'My Orders and Wishlist', icon: Heart, path: '/customer/orders-wishlist' },
    { name: 'Notifications', icon: Bell, path: '/customer/notifications' },
    { name: 'Send Feedback', icon: MessageSquare, path: '/customer/send-feedback' }
  ];
  return (
    <DashboardLayout
      title="Notifications"
      navItems={navItems}
      activeNavItem="Notifications"
      setActiveNavItem={() => {}}
      userEmail="john.doe@example.com"
      userInitials="JD"
    >
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          notifications.map((notification) => (
            <Card className="bg-teal-300" key={notification.id}>
              <CardHeader className="text-gray-500">
                <CardTitle>Notification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-md text-gray-500">{notification.message}</p>
                <small className="text-sm text-gray-500">{notification.date}</small>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
