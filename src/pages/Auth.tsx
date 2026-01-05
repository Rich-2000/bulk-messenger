import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { MessageSquare, Zap, Send, BarChart3 } from 'lucide-react';
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
      {/* Left side - Animated Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 xl:p-16">
        <div className="max-w-xl mx-auto h-full flex flex-col justify-center items-center">
          {/* Animated Logo Container */}
          <div className="relative mb-12">
            {/* Outer pulse ring */}
            <div className="absolute -inset-8 rounded-full border-4 border-white/20 animate-pulse"></div>
            
            {/* Animated icon ring */}
            <div className="relative w-48 h-48 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center">
              
              {/* Rotating message icons */}
              <div className="absolute w-full h-full">
                <MessageSquare 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/70 animate-bounce"
                  size={32}
                />
                <Send 
                  className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-white/70 animate-pulse"
                  size={32}
                />
                <Zap 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white/70 animate-pulse"
                  size={32}
                />
                <BarChart3 
                  className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 text-white/70 animate-bounce"
                  size={32}
                />
              </div>

              {/* Center logo */}
              <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm ring-1 ring-white/30 flex flex-col items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={40} className="text-white mx-auto mb-2 animate-float" />
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      Bulk
                      <span className="block text-2xl font-semibold text-primary-100">
                        Messenger
                      </span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights with subtle animations */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center ring-1 ring-green-400/30 group-hover:scale-110 transition-transform">
                  <Zap size={20} className="text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Fast Delivery</p>
                  <p className="text-xs text-primary-100">Real-time sending</p>
                </div>
              </div>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-400/20 flex items-center justify-center ring-1 ring-blue-400/30 group-hover:scale-110 transition-transform">
                  <BarChart3 size={20} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Live Analytics</p>
                  <p className="text-xs text-primary-100">Track performance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Animated dots pattern */}
          <div className="mt-12 relative w-full max-w-sm h-24 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md mx-auto">
          <AuthForm mode={mode} onSwitchMode={() => setMode(mode === 'login' ? 'register' : 'login')} />
        </div>
      </div>
    </div>
  );
};

export default Auth;