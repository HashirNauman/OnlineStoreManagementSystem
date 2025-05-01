import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import Button from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Link } from "react-router-dom";
import DashboardLayout from './components/dashboard-layout';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  registerables,
  PointElement,
  LinearScale,
  LineElement,
  TimeScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
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

ChartJS.register(...registerables, PointElement, LinearScale, LineElement, TimeScale, CategoryScale, Tooltip, Legend);

type Metric = {
  total_revenue: string;
  revenue_change: number;
  active_users: number;
  new_users: number;
  total_orders: number;
  order_change: number;
  customer_satisfaction: number;
  reviews_count: number;
};

type ActivityItem = {
  id: string;
  user_name: string;
  avatarUrl: string;
  action: string;
  time: string;
};

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Manage Cashiers', icon: UserCog, path: '/admin/manage-cashier' },
  { name: 'Customer History', icon: Users, path: '/admin/customer-history' },
  { name: 'Inventory', icon: Package, path: '/admin/inventory' },
  { name: 'Feedback', icon: Package, path:'/admin/feedback' },
];

const revenueChartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
};

export default function AdminDashboard() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
  const [activeNavItem, setActiveNavItem] = React.useState(navItems[0].name);
  const [metrics, setMetrics] = React.useState<Metric | null>(null);
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [revenueData, setRevenueData] = React.useState<number[]>([]);
  const [months, setMonths] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/metrics/`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setMetrics(response.data[0]); // Extract the first object from the array
        } else {
          console.error('Invalid metrics data format or empty data');
          setMetrics(null);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics(null);
      }
    };
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/activities/`);
        if (Array.isArray(response.data)) {
          setActivities(response.data);
        } else {
          console.error('Invalid activities data format');
          setActivities([]);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      }
    };

    const fetchRevenueData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/revenue/`);
        const data = response.data;
        if (Array.isArray(data)) {
          setRevenueData(data.map((item: any) => item.revenue));
          setMonths(data.map((item: any) => item.month));
        } else {
          console.error('Invalid revenue data format');
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };

    fetchMetrics();
    fetchActivities();
    fetchRevenueData();
    setLoading(false); // End loading state after data is fetched
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!metrics) {
    return <div></div>;
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      navItems={navItems}
      activeNavItem={activeNavItem}
      setActiveNavItem={setActiveNavItem}
      userEmail="admin@example.com"
      userInitials="AD"
    >
      <div className="space-y-6 p-6">
        {/* Key Metrics Section */}
        {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md bg-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-green-600">
            <CardTitle className="text-lg font-semibold">Total Revenue</CardTitle>
            <DollarSign className="h-8 w-8 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${metrics.total_revenue}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-blue-600">
            <CardTitle className="text-lg font-semibold">Active Users</CardTitle>
            <Users className="h-8 w-8 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.active_users}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-purple-600">
            <CardTitle className="text-lg font-semibold">New Users</CardTitle>
            <UserCog className="h-8 w-8 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.new_users}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-yellow-600">
            <CardTitle className="text-lg font-semibold">Total Orders</CardTitle>
            <ShoppingBag className="h-8 w-8 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.total_orders}</div>
          </CardContent>
        </Card>
      </div>

        {/* User Activity and Revenue Chart Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className='bg-gray-300'>
            <CardHeader className='text-purple-600'>
              <CardTitle className="text-lg font-semibold text-blue-700">Recent User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 overflow-y-auto max-h-48 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id || index} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={activity.avatarUrl || 'https://via.placeholder.com/150'} alt={activity.user_name} />
                        <AvatarFallback>{activity.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium text-purple-700">{activity.user_name}</p>
                        <p className="text-xs text-muted-foreground text-gray-500">
                          {activity.action} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No activities found</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className='bg-red-100'>
            <CardHeader className='text-red-500'>
              <CardTitle className="text-lg font-semibold text-blue-700">Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <Line
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: 'Revenue',
                        data: revenueData,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={revenueChartOptions}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  change: number;
  trend: 'up' | 'down';
  changeLabel: string;
  subtext?: string;
}> = ({ title, value, icon, change, trend, changeLabel, subtext }) => (
  <Card className="flex flex-col h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="text-2xl font-bold text-blue-600">{value}</div>
      <p className="text-xs text-muted-foreground">
        {trend === 'up' ? (
          <TrendingUp className="h-4 w-4 text-green-500 inline mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500 inline mr-1" />
        )}
        {change}% {changeLabel}
      </p>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </CardContent>
  </Card>
);
