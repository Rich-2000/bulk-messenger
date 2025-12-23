import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { messagesAPI } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Mail,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const Analytics: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['messageStats'],
    queryFn: () => messagesAPI.getMessageStats(),
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => messagesAPI.getMessages(),
  });

  // Safely extract messages array
  const messages = Array.isArray(messagesData?.data) ? messagesData.data : [];

  // Calculate message type distribution
  const messagesByType = messages.reduce((acc: any, msg: any) => {
    acc[msg.type] = (acc[msg.type] || 0) + 1;
    return acc;
  }, {});

  // Calculate daily message counts for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'MMM dd'),
      count: messages.filter((msg: any) => {
        const msgDate = new Date(msg.createdAt);
        return format(msgDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      }).length,
    };
  });

  const maxCount = Math.max(...last7Days.map(d => d.count), 1);

  if (statsLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your messaging performance and engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.data?.overall?.totalMessages || 0}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.data?.overall?.successfulSends || 0}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Successful Sends</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.data?.overall?.failedSends || 0}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Failed Sends</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.data?.overall?.totalRecipients
              ? `${Math.round((stats.data.overall.successfulSends / stats.data.overall.totalRecipients) * 100)}%`
              : '0%'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Volume Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Message Volume (Last 7 Days)
            </h3>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {last7Days.map((day, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {day.date}
                  </span>
                  <span className="text-sm font-semibold text-primary-600">
                    {day.count}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${(day.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Message Type Distribution
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <MessageSquare className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">SMS Messages</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Text message campaigns
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {messagesByType?.sms || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {messages.length > 0
                    ? `${Math.round(((messagesByType?.sms || 0) / messages.length) * 100)}%`
                    : '0%'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Mail className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email Campaigns</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bulk email messages
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {messagesByType?.email || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {messages.length > 0
                    ? `${Math.round(((messagesByType?.email || 0) / messages.length) * 100)}%`
                    : '0%'}
                </p>
              </div>
            </div>

            {/* Total Bar */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 transition-all duration-500"
                  style={{
                    width: messages.length > 0
                      ? `${((messagesByType?.sms || 0) / messages.length) * 100}%`
                      : '0%',
                  }}
                />
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{
                    width: messages.length > 0
                      ? `${((messagesByType?.email || 0) / messages.length) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Performance Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Delivery Rate
              </span>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {stats?.data?.overall?.totalRecipients
                ? `${Math.round((stats.data.overall.successfulSends / stats.data.overall.totalRecipients) * 100)}%`
                : '0%'}
            </p>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{
                  width: stats?.data?.overall?.totalRecipients
                    ? `${(stats.data.overall.successfulSends / stats.data.overall.totalRecipients) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Failure Rate
              </span>
              <XCircle className="text-red-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {stats?.data?.overall?.totalRecipients
                ? `${Math.round((stats.data.overall.failedSends / stats.data.overall.totalRecipients) * 100)}%`
                : '0%'}
            </p>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{
                  width: stats?.data?.overall?.totalRecipients
                    ? `${(stats.data.overall.failedSends / stats.data.overall.totalRecipients) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Today's Activity
              </span>
              <Clock className="text-orange-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {stats?.data?.today?.todayMessages || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Messages sent today
            </p>
          </div>
        </div>
      </div>

      {/* Total Recipients */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Recipients Reached
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unique recipients across all campaigns
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-5xl font-bold text-primary-600">
                {stats?.data?.overall?.totalRecipients || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Total recipients
              </p>
            </div>
            <Users className="text-gray-300 dark:text-gray-600" size={64} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;