// components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiSun, FiMoon, 
  FiBriefcase, FiHome, FiSearch, FiTag, FiCalendar, 
  FiUserPlus, FiShield, FiUsers
} from 'react-icons/fi';
// Import both logos from assets
import logoLight from '../assets/discovertbilisilight.png';
import logoDark from '../assets/discovertbilisidark.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout, isAuthenticated, isAdmin, isAgent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/businesses', label: 'Businesses', icon: FiSearch },
    { to: '/real-estate', label: 'Real Estate', icon: FiHome },
    { to: '/deals', label: 'Deals', icon: FiTag },
    { to: '/events', label: 'Events', icon: FiCalendar }
  ];

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/real-estate');
  };

  // Choose logo based on theme
  const currentLogo = theme === 'dark' ? logoDark : logoLight;
  const glowEffect = theme === 'dark' 
    ? 'dark:filter dark:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] dark:hover:drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]'
    : '';

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isAgent) return '/agent/dashboard';
    return '/dashboard';
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.full_name) {
      return user.full_name[0].toUpperCase();
    }
    return 'U';
  };

  // Handle dropdown toggle
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) setShowDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src={currentLogo} 
              alt="Discover Tbilisi" 
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain transition-all duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-1 text-sm lg:text-base"
                >
                  <Icon className="text-sm" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun className="text-yellow-400 text-lg sm:text-xl" /> : <FiMoon className="text-gray-600 text-lg sm:text-xl" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium">
                      {getUserInitial()}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                  {isAgent && (
                    <span className="hidden sm:inline text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                      Agent
                    </span>
                  )}
                  {isAdmin && (
                    <span className="hidden sm:inline text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-dropdown border border-gray-200 dark:border-gray-700 py-2 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      {isAgent && (
                        <span className="inline-block mt-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                          👤 Agent
                        </span>
                      )}
                      {isAdmin && (
                        <span className="inline-block mt-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                          🔐 Admin
                        </span>
                      )}
                    </div>
                    
                    {/* Dashboard Link - Based on role */}
                    <Link
                      to={getDashboardPath()}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FiShield className="inline mr-2" />
                      {isAdmin ? 'Admin Panel' : isAgent ? 'Agent Dashboard' : 'Dashboard'}
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        to="/admin/agents"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiUsers className="inline mr-2" />
                        Manage Agents
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiLogOut className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/agent/register"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg rounded-lg transition-all flex items-center gap-1"
                >
                  <FiUserPlus className="text-sm" />
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-700 mb-2">
              <img 
                src={currentLogo} 
                alt="Discover Tbilisi" 
                className="h-10 w-auto object-contain"
              />
            </div>
            
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-3"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {!isAuthenticated && (
              <div className="mt-4 px-4 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/agent/register"
                  className="block w-full text-center px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {isAuthenticated && (
              <div className="mt-4 px-4 space-y-2">
                <Link
                  to={getDashboardPath()}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <FiShield />
                  {isAdmin ? 'Admin Panel' : isAgent ? 'Agent Dashboard' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;