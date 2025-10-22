// frontend/src/context/AppContext.js
// Application context for global state management

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  wallet: null,
  appId: null,
  userRole: 'viewer',
  contractState: null,
  isLoading: false,
  error: null,
  notifications: []
};

// Action types
const ActionTypes = {
  SET_WALLET: 'SET_WALLET',
  SET_APP_ID: 'SET_APP_ID',
  SET_USER_ROLE: 'SET_USER_ROLE',
  SET_CONTRACT_STATE: 'SET_CONTRACT_STATE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_WALLET:
      return { ...state, wallet: action.payload };
    
    case ActionTypes.SET_APP_ID:
      return { ...state, appId: action.payload };
    
    case ActionTypes.SET_USER_ROLE:
      return { ...state, userRole: action.payload };
    
    case ActionTypes.SET_CONTRACT_STATE:
      return { ...state, contractState: action.payload };
    
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case ActionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedAppId = localStorage.getItem('fairlens_app_id');
    const savedUserRole = localStorage.getItem('fairlens_user_role');
    
    if (savedAppId) {
      dispatch({ type: ActionTypes.SET_APP_ID, payload: savedAppId });
    }
    if (savedUserRole) {
      dispatch({ type: ActionTypes.SET_USER_ROLE, payload: savedUserRole });
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (state.appId) {
      localStorage.setItem('fairlens_app_id', state.appId);
    }
  }, [state.appId]);

  useEffect(() => {
    if (state.userRole) {
      localStorage.setItem('fairlens_user_role', state.userRole);
    }
  }, [state.userRole]);

  // Action creators
  const actions = {
    setWallet: (wallet) => dispatch({ type: ActionTypes.SET_WALLET, payload: wallet }),
    setAppId: (appId) => dispatch({ type: ActionTypes.SET_APP_ID, payload: appId }),
    setUserRole: (userRole) => dispatch({ type: ActionTypes.SET_USER_ROLE, payload: userRole }),
    setContractState: (contractState) => dispatch({ type: ActionTypes.SET_CONTRACT_STATE, payload: contractState }),
    setLoading: (isLoading) => dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    addNotification: (notification) => {
      const id = Date.now() + Math.random();
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { ...notification, id } });
      
      // Auto-remove notification after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
        }, notification.duration || 5000);
      }
    },
    removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
    clearNotifications: () => dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
