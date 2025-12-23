import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  MessageSquare,
  Users,
  Send,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['messageStats'],
    queryFn: () => messagesAPI.getMessageStats(),
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['recentMessages'],
    queryFn: () => messagesAPI.getMessages({ limit: 5 }),
  });

  // Safely extract messages array
  const recentMessages = Array.isArray(messagesData?.data) ? messagesData.data : [];

  const statCards = [
    {
      title: 'Total Messages',
      value: stats?.data?.overall?.totalMessages || 0,
      icon: MessageSquare,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Recipients',
      value: stats?.data?.overall?.totalRecipients || 0,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Success Rate',
      value: stats?.data?.overall?.totalRecipients 
        ? `${Math.round((stats.data.overall.successfulSends / stats.data.overall.totalRecipients) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Today\'s Messages',
      value: stats?.data?.today?.todayMessages || 0,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      change: 'Today',
      trend: 'neutral'
    },
  ];

  if (statsLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-primary-100 text-lg">
                You have <span className="font-semibold text-white">{user?.credits?.toLocaleString()}</span> credits remaining
              </p>
            </div>
            <Link
              to="/messages"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Send size={20} className="mr-2" />
              Send New Message
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={stat.iconColor} size={24} />
              </div>
              {stat.trend !== 'neutral' && (
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Messages
            </h3>
            <Link
              to="/messages"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1 group"
            >
              View All
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentMessages.length > 0 ? (
              recentMessages.map((message: any) => (
                <div
                  key={message._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      message.type === 'sms' 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {message.type === 'sms' ? (
                        <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Mail size={18} className="text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {message.type.toUpperCase()} - {message.totalRecipients} recipients
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    message.status === 'sent'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : message.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {message.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={48} />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No messages yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Send your first message to see it here
                </p>
                <Link
                  to="/messages"
                  className="inline-flex items-center mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  <Send size={16} className="mr-2" />
                  Send Message
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Overview
            </h3>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          
          <div className="space-y-6">
            {/* Delivery Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Delivery Rate
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {stats?.data?.overall?.totalRecipients
                    ? `${Math.round((stats.data.overall.successfulSends / stats.data.overall.totalRecipients) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{
                    width: stats?.data?.overall?.totalRecipients
                      ? `${(stats.data.overall.successfulSends / stats.data.overall.totalRecipients) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            {/* Failure Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Failure Rate
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {stats?.data?.overall?.totalRecipients
                    ? `${Math.round((stats.data.overall.failedSends / stats.data.overall.totalRecipients) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                  style={{
                    width: stats?.data?.overall?.totalRecipients
                      ? `${(stats.data.overall.failedSends / stats.data.overall.totalRecipients) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="mx-auto mb-2 text-green-500" size={28} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.data?.overall?.successfulSends || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="mx-auto mb-2 text-red-500" size={28} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.data?.overall?.failedSends || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/messages?type=sms"
            className="group p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Send SMS</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bulk SMS messaging</p>
          </Link>
          
          <Link
            to="/messages?type=email"
            className="group p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Send Email</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bulk email campaigns</p>
          </Link>
          
          <Link
            to="/contacts"
            className="group p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Import Contacts</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload CSV or vCard</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;