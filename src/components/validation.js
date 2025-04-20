export const validateSignup = (data) => {
    const errors = {};
    
    // Email validation
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Invalid email address';
    }
    
    // Username validation
    if (!data.username) {
      errors.username = 'Username is required';
    } else if (data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Terms acceptance
    if (!data.termsAccepted) {
      errors.termsAccepted = 'You must accept the terms of service';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  export const validateLogin = (data) => {
    const errors = {};
    
    // Identifier validation (email or username)
    if (!data.identifier) {
      errors.identifier = 'Email or username is required';
    }
    
    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  