import { useState, useEffect } from 'react'; 
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; 
import LoadingSpinner from '../../components/LoadingSpinner'; 
import { motion, AnimatePresence } from 'framer-motion'; 

// SVG path definitions
const USER_ICON_PATH_D = "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z";
const LOCK_ICON_PATH_D = "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z";

interface LocationState { 
  from?: { 
    pathname: string; 
  };
}

const pageVariants = { 
  initial: { 
    opacity: 0, 
    y: 20, 
  },
  in: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: "easeInOut", 
      when: "beforeChildren", 
    }
  },
  out: { 
    opacity: 0, 
    y: -20, 
    transition: { 
      duration: 0.3, 
      ease: "easeInOut", 
      when: "afterChildren", 
    }
  }
};

const containerVariants = { 
  hidden: { opacity: 0 }, 
  visible: { 
    opacity: 1, 
    transition: { 
      when: "beforeChildren", 
      staggerChildren: 0.1, 
      delayChildren: 0.2 
    }
  },
  exit: { 
    opacity: 0, 
    transition: { 
      when: "afterChildren", 
      staggerChildren: 0.05, 
      staggerDirection: -1 
    }
  }
};

const itemVariants = { 
  hidden: { y: 20, opacity: 0 }, 
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
  exit: { 
    y: -20, 
    opacity: 0 
  }
};

const buttonVariants = { 
  idle: { 
    scale: 1, 
    backgroundColor: "rgb(37, 99, 235)" 
  },
  hover: { 
    scale: 1.05, 
    backgroundColor: "rgb(29, 78, 216)", 
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
  },
  tap: { 
    scale: 0.95 
  },
  submitting: { 
    backgroundColor: "rgb(29, 78, 216)", 
    transition: { 
      duration: 0.3 
    }
  }
};

const LoginPage = () => { 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const { login, isAuthenticated, isLoading } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation(); 
  
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard'; 

  useEffect(() => { 
    if (isAuthenticated && !isLoading) { 
      navigate(from, { replace: true }); 
    }
  }, [isAuthenticated, isLoading, navigate, from]); 

  if (isAuthenticated && !isLoading) { 
    return <Navigate to={from} replace />; 
  }

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setError(''); 
    setIsSubmitting(true); 

    try {
      await login(username, password); 
    } catch (err) { 
      console.error('Login error:', err); 
      setError('Invalid username or password. Please try again.'); 
      setIsSubmitting(false); 
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner size="lg" color="blue" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-12 sm:px-6 lg:px-8"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <motion.div 
        className="w-full max-w-md space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <motion.div 
            className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white shadow-md mb-5"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <span className="text-3xl font-bold text-blue-600">S</span>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-white mb-2"
            variants={itemVariants}
          >
            StudentHub
          </motion.h1>
          <motion.h2 
            className="text-xl font-medium text-blue-100"
            variants={itemVariants}
          >
            Sign in to access your peer learning platform
          </motion.h2>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          variants={itemVariants}
          whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="p-8">
            {error && (
              <motion.div 
                className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" 
                role="alert"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <p className="text-red-700">{error}</p>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d={USER_ICON_PATH_D} clipRule="evenodd" />
                    </svg>
                  </div>
                  <motion.input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`py-3 pl-10 block w-full border ${username.trim().length > 0 && username.trim().length < 3 ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900`}
                    disabled={isSubmitting}
                    placeholder="Enter your username"
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                  />
                </div>
                {username.trim().length > 0 && username.trim().length < 3 && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Username must be at least 3 characters long
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d={LOCK_ICON_PATH_D} clipRule="evenodd" />
                    </svg>
                  </div>
                  <motion.input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`py-3 pl-10 block w-full border ${password.trim().length > 0 && password.trim().length < 3 ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900`}
                    disabled={isSubmitting}
                    placeholder="Enter your password"
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                  />
                </div>
                {password.trim().length > 0 && password.trim().length < 3 && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Password must be at least 3 characters long
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting || username.trim().length < 3 || password.trim().length < 3}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white focus:outline-none ${
                    isSubmitting || username.trim().length < 3 || password.trim().length < 3
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!isSubmitting && username.trim().length >= 3 && password.trim().length >= 3 ? "hover" : undefined}
                  whileTap={!isSubmitting && username.trim().length >= 3 && password.trim().length >= 3 ? "tap" : undefined}
                  animate={isSubmitting ? "submitting" : "idle"}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center"
                      >
                        <div className="-ml-1 mr-2">
                          <LoadingSpinner size="sm" color="white" />
                        </div>
                        Signing in...
                      </motion.div>
                    ) : (
                      <motion.span
                        key="sign-in"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                      >
                        Sign in
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </form>
          </div>
          
          <motion.div 
            className="px-8 py-4 bg-gray-50 border-t border-gray-100"
            variants={itemVariants}
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                New to StudentHub? <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">Create an account</Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <p className="text-sm text-blue-200">
            &copy; {new Date().getFullYear()} StudentHub. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage; 