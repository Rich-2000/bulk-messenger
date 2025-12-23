import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      toast.success('Google login successful!');
      window.location.href = '/dashboard';
    }
  }, [token]);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left side - Brand/Info (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 xl:p-16">
        <div className="max-w-xl mx-auto h-full flex flex-col justify-center">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                <MessageSquare size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">BulkMessenger</h1>
            </div>
            <p className="text-2xl font-semibold text-white mb-3">
              Professional Bulk Messaging Platform
            </p>
            <p className="text-lg text-primary-100">
              Send SMS and email campaigns to thousands of recipients with ease
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center ring-1 ring-green-400/30">
                <CheckCircle className="text-green-300" size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1.5">High Delivery Rates</h3>
                <p className="text-primary-100 text-sm leading-relaxed">
                  Industry-leading 99%+ message delivery rate with real-time tracking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center ring-1 ring-green-400/30">
                <CheckCircle className="text-green-300" size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1.5">Bulk Messaging</h3>
                <p className="text-primary-100 text-sm leading-relaxed">
                  Send to thousands of contacts simultaneously with personalized content
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center ring-1 ring-green-400/30">
                <CheckCircle className="text-green-300" size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1.5">Real-time Analytics</h3>
                <p className="text-primary-100 text-sm leading-relaxed">
                  Track delivery, opens, and engagement metrics with detailed insights
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-primary-100 text-sm font-medium">
              Trusted by <span className="text-white font-semibold">5,000+</span> businesses worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full">
          <AuthForm mode={mode} onSwitchMode={() => setMode(mode === 'login' ? 'register' : 'login')} />
        </div>
      </div>
    </div>
  );
};

export default Auth;