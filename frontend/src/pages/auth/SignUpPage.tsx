import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createBaseConfig } from '../../config';
import { UsersApi } from '../../api/apis';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';

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
      staggerChildren: 0.07,
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

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validators: Record<string, (value: string) => string> = {
    firstName: (value) =>
      value.trim().length < 2 ? 'First name must be at least 2 characters' : '',
    lastName: (value) =>
      value.trim().length < 2 ? 'Last name must be at least 2 characters' : '',
    email: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ''
        : 'Please enter a valid email address',
    username: (value) =>
      value.trim().length < 6 ? 'Username must be at least 6 characters' : '',
    password: (value) =>
      value.trim().length < 6 ? 'Password must be at least 6 characters' : '',
    confirmPassword: (value) =>
      value !== password ? 'Passwords do not match' : '',
  };

  const validateField = (name: string, value: string) => {
    const validator = validators[name];
    if (!validator) return;
  
    const error = validator(value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
  
    for (const [field, validator] of Object.entries(validators)) {
      const value = eval(field);
      errors[field] = validator(value);
    }
  
    setFormErrors(errors);
    return Object.values(errors).every((e) => e === '');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const usersApi = new UsersApi(createBaseConfig());
      
      await usersApi.createUsers({
        userCreate: {
          firstName,
          lastName,
          email,
          username,
          passwordHash: password,
          roleId: 1,
          isActive: true,
        }
      });
      
      await login(username, password);
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error during signup:', err);
      let errorMsg = 'Failed to create account. Please try again.';
      
      if (err.response && err.response.data) {
        try {
          const responseData = await err.response.json();
          if (responseData.detail) {
            errorMsg = Array.isArray(responseData.detail) 
              ? responseData.detail.map((error: any) => error.msg).join(', ') 
              : responseData.detail;
          }
        } catch (jsonErr) {
          console.error('Error parsing error response:', jsonErr);
        }
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormValid = () => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
      username.trim().length >= 3 &&
      password.trim().length >= 3 &&
      password === confirmPassword
    );
  };
  
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <motion.div 
        className="max-w-md w-full bg-white rounded-xl shadow-md p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.h2 
            className="text-3xl font-bold text-gray-900"
            variants={itemVariants}
          >
            Create an Account
          </motion.h2>
          <motion.p 
            className="mt-2 text-gray-600"
            variants={itemVariants}
          >
            Join our learning platform
          </motion.p>
        </motion.div>
        
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
          <motion.div 
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            variants={itemVariants}
          >
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <motion.input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  validateField('firstName', e.target.value);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
              />
              {formErrors.firstName && (
                <motion.p 
                  className="mt-1 text-sm text-red-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {formErrors.firstName}
                </motion.p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <motion.input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  validateField('lastName', e.target.value);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
              />
              {formErrors.lastName && (
                <motion.p 
                  className="mt-1 text-sm text-red-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {formErrors.lastName}
                </motion.p>
              )}
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <motion.input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField('email', e.target.value);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
            />
            {formErrors.email && (
              <motion.p 
                className="mt-1 text-sm text-red-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {formErrors.email}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <motion.input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                validateField('username', e.target.value);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
            />
            {formErrors.username && (
              <motion.p 
                className="mt-1 text-sm text-red-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {formErrors.username}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <motion.input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField('password', e.target.value);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
            />
            {formErrors.password && (
              <motion.p 
                className="mt-1 text-sm text-red-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {formErrors.password}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <motion.input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validateField('confirmPassword', e.target.value);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
            />
            {formErrors.confirmPassword && (
              <motion.p 
                className="mt-1 text-sm text-red-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {formErrors.confirmPassword}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white focus:outline-none ${
                isLoading || !isFormValid()
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
              variants={buttonVariants}
              initial="idle"
              whileHover={!isLoading && isFormValid() ? "hover" : undefined}
              whileTap={!isLoading && isFormValid() ? "tap" : undefined}
              animate={isLoading ? "submitting" : "idle"}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
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
                    Creating account...
                  </motion.div>
                ) : (
                  <motion.span
                    key="sign-up"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    Create Account
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SignUpPage; 