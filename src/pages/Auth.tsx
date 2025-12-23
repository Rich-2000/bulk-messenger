import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { CheckCircle ,MessageSquare, } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand/Info */}
      <div className="md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12 text-white">
        <div className="max-w-lg mx-auto h-full flex flex-col justify-center">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageSquare size={28} />
              </div>
              <h1 className="text-3xl font-bold">BulkMessenger</h1>
            </div>
            <p className="text-xl font-medium mb-2">
              Professional Bulk Messaging Platform
            </p>
            <p className="text-primary-100">
              Send SMS and email campaigns to thousands of recipients with ease
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-300 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-1">High Delivery Rates</h3>
                <p className="text-primary-100">
                  Industry-leading 99%+ message delivery rate
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-300 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-1">Bulk Messaging</h3>
                <p className="text-primary-100">
                  Send to thousands of contacts simultaneously
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-300 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-1">Real-time Analytics</h3>
                <p className="text-primary-100">
                  Track delivery, opens, and engagement metrics
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-primary-100 text-sm">
              Trusted by 5000+ businesses worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <AuthForm mode={mode} onSwitchMode={() => setMode(mode === 'login' ? 'register' : 'login')} />
        </div>
      </div>
    </div>
  );
};

export default Auth;