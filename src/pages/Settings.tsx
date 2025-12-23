import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Bell,
  Moon,
  Sun,
  Mail,
  Phone,
  CreditCard,
  Save,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    messageUpdates: true,
    campaignReports: true,
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: theme === 'dark' ? Moon : Sun },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    toast.success('Notification preferences updated!');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h3>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="input-field pl-12"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        className="input-field pl-12"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" className="btn-primary">
                      <Save size={20} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h3>
                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Email Notifications
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          SMS Notifications
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.smsNotifications}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              smsNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Message Updates
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get notified about message delivery status
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.messageUpdates}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              messageUpdates: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Campaign Reports
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive weekly campaign performance reports
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.campaignReports}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              campaignReports: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" className="btn-primary">
                      <Save size={20} className="mr-2" />
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Appearance Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Theme
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          theme === 'light'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                        }`}
                      >
                        <Sun className={`mx-auto mb-3 ${
                          theme === 'light' ? 'text-primary-600' : 'text-gray-400'
                        }`} size={32} />
                        <p className="font-medium text-gray-900 dark:text-white">Light Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Bright and clean interface
                        </p>
                      </button>

                      <button
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                        }`}
                      >
                        <Moon className={`mx-auto mb-3 ${
                          theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                        }`} size={32} />
                        <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Easy on the eyes at night
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Billing & Credits
                </h3>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Available Credits</p>
                        <p className="text-4xl font-bold">{user?.credits?.toLocaleString() || 0}</p>
                      </div>
                      <CreditCard size={48} className="opacity-50" />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Purchase More Credits
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 transition-colors text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1,000</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">$10</p>
                      </button>
                      <button className="p-4 border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
                        <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-2">
                          POPULAR
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">5,000</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">$45</p>
                      </button>
                      <button className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 transition-colors text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">10,000</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">$85</p>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Billing History
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      No billing history available
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;