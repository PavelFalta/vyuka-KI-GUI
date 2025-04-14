import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createBaseConfig } from '../../config';
import { UsersApi } from '../../api/apis';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import { NotFoundPage } from '../ErrorPages';

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
  return (
    <NotFoundPage /> // well rip, neplacenej intern nam smazal prihlasovaci stranku
  );
};

export default SignUpPage; 