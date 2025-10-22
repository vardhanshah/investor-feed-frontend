// Error handling utilities for API errors

export interface ErrorInfo {
  title: string;
  message: string;
  action?: string;
}

/**
 * Converts API errors into user-friendly messages
 */
export function getErrorMessage(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (message.includes('not authenticated') || message.includes('401')) {
      return {
        title: 'Authentication Required',
        message: 'Please log in to continue',
        action: 'redirect_login',
      };
    }

    if (message.includes('invalid credentials')) {
      return {
        title: 'Login Failed',
        message: 'Invalid email or password. Please try again.',
      };
    }

    if (message.includes('email already registered')) {
      return {
        title: 'Registration Failed',
        message: 'This email is already registered. Please use a different email or try logging in.',
      };
    }

    // Validation errors
    if (message.includes('password must contain')) {
      return {
        title: 'Weak Password',
        message: error.message,
      };
    }

    if (message.includes('passwords do not match')) {
      return {
        title: 'Password Mismatch',
        message: 'The passwords you entered do not match.',
      };
    }

    // Permission errors
    if (message.includes('permission') || message.includes('403')) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
      };
    }

    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return {
        title: 'Not Found',
        message: 'The requested resource was not found.',
      };
    }

    // Server errors (500)
    if (message.includes('500') || message.includes('internal server error') || message.includes('server error')) {
      return {
        title: 'Uh-oh! Something went wrong.',
        message: 'We encountered an unexpected error. Please try again later.',
      };
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
      };
    }

    // Default to the error message
    return {
      title: 'Error',
      message: error.message,
    };
  }

  // Unknown error type
  return {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Checks if an error requires user logout
 */
export function shouldLogout(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('not authenticated') ||
      message.includes('invalid token') ||
      message.includes('token expired') ||
      message.includes('could not validate credentials')
    );
  }
  return false;
}

/**
 * Checks if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch failed') ||
      error.name === 'NetworkError'
    );
  }
  return false;
}
