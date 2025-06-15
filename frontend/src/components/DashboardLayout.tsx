import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  FileText, 
  Settings, 
  MessageCircle, 
  Home, 
  Bell, 
  Menu, 
  X,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import { useToast } from '@/hooks/use-toast';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
}

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and statistics'
    },
    {
      label: 'Forum',
      href: '/dashboard/community',
      icon: MessageCircle,
      description: 'Community discussions'
    },
    {
      label: 'Garage',
      href: '/dashboard/cars',
      icon: Car,
      description: 'Vehicle management'
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      description: 'Profile and preferences'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActivePath = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-semibold text-lg tracking-tight">SI</span>
            </div>
            <div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                Sunday Insurance
              </span>
              <div className="text-xs text-gray-500 font-medium tracking-wide">Dashboard</div>
            </div>
          </div>          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-gray-100 rounded-xl h-8 w-8 p-0"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Avatar className="w-11 h-11 border border-gray-200 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium text-sm">
                {user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm tracking-tight">{user?.displayName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <div className="flex items-center mt-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="block group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-gray-200/50 group-hover:bg-white'
                  }`}>
                    <Icon className={`h-4 w-4 transition-colors duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </p>
                    <p className={`text-xs transition-colors duration-200 ${
                      isActive ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out Section */}
      <div className="p-4 border-t border-gray-200/30">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all duration-200 group h-auto"
        >
          <div className="p-2 rounded-lg bg-gray-200/50 group-hover:bg-red-100 mr-3 transition-all duration-200">
            <LogOut className="h-4 w-4 group-hover:text-red-600 transition-colors duration-200" />
          </div>
          <span className="font-medium text-sm">Sign Out</span>
        </Button>
      </div>
    </div>
  );
  return (
    <div className="h-screen flex bg-stone-50 overflow-hidden" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5f5f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundColor: '#fdfcf8'
    }}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-white/80 backdrop-blur-2xl border-r border-gray-200/60 z-50 lg:hidden shadow-2xl shadow-black/10"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-80 bg-white/80 backdrop-blur-2xl border-r border-gray-200/60 shadow-xl shadow-black/5 flex-shrink-0">
        <SidebarContent />
      </aside>      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-2xl border-b border-gray-200/60 z-30 shadow-sm shadow-black/5 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden hover:bg-gray-100 rounded-xl h-8 w-8 p-0"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4 text-gray-700" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                    {sidebarItems.find(item => isActivePath(item.href))?.label || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">
                    {sidebarItems.find(item => isActivePath(item.href))?.description || 'Welcome back!'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-xl h-8 w-8 p-0">
                  <Bell className="h-4 w-4 text-gray-600" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <Avatar className="w-8 h-8 border border-gray-200 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-medium">
                    {user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>        {/* Page Content - iOS-inspired paper texture background */}
        <main className="flex-1 p-6 overflow-auto" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5f5f0' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#faf9f6'
        }}>
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
