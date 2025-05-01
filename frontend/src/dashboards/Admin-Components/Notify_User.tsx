import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Button from "../components/ui/button";
import DashboardLayout from "../components/dashboard-layout";
import { MessageSquare } from "lucide-react";
import axios from "axios";
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
interface Notification {
  id: number;
  message: string;
  date: string;
}
const navItems = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Manage Cashiers', icon: UserCog, path: '/admin/manage-cashier' },
  { name: 'Customer History', icon: Users, path: '/admin/customer-history' },
  { name: 'Inventory', icon: Package, path: '/admin/inventory' },
  { name: 'Feedback', icon: Package, path:'/admin/feedback' },
];
export default function NotifyUser() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState("");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleNotifyUser = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/notify/`, {
        message: message,
        customer_id: 1, // Example customer ID
      });
      setNotifications([...notifications, response.data]);
      setMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <DashboardLayout
      title="Notify User"
      navItems={navItems}
      activeNavItem="NotifyUser"
      setActiveNavItem={() => {}}
      userEmail="admin@example.com"
      userInitials="AD"
    >
      <Card className="bg-teal-300">
        <CardHeader>
          <CardTitle>Notify User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              className="w-full p-2 border rounded text-black"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
            />
            <Button onClick={handleNotifyUser}>Send Notification</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
