// Centralized toast messages for the application
// This makes it easier to maintain consistency and enables future i18n support

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface ToastMessage {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

// Authentication messages
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: {
    title: 'Welcome back!',
    description: 'You have successfully logged in.',
    variant: 'success' as ToastVariant,
  },
  SIGNUP_SUCCESS: (name: string): ToastMessage => ({
    title: 'Account Created!',
    description: `Welcome, ${name}! Please log in to continue.`,
    variant: 'success',
  }),
  LOGOUT_SUCCESS: {
    title: 'Logged out',
    description: 'You have been successfully logged out.',
    variant: 'info' as ToastVariant,
  },
};

// Feed messages
export const FEED_MESSAGES = {
  DELETED: (name: string): ToastMessage => ({
    title: 'Success',
    description: `Feed "${name}" deleted successfully`,
    variant: 'success',
  }),
  CREATED: {
    title: 'Success',
    description: 'Feed configuration created successfully',
    variant: 'success' as ToastVariant,
  },
  UPDATED: {
    title: 'Success',
    description: 'Feed configuration updated successfully',
    variant: 'success' as ToastVariant,
  },
  SUBSCRIBED: (name: string): ToastMessage => ({
    title: 'Subscribed',
    description: `You will now receive notifications for "${name}"`,
    variant: 'success',
  }),
  UNSUBSCRIBED: (name: string): ToastMessage => ({
    title: 'Unsubscribed',
    description: `You will no longer receive notifications for "${name}"`,
    variant: 'info',
  }),
  NO_FEEDS_AVAILABLE: {
    title: 'No Feeds',
    description: 'No feed configurations available. Please create a feed first.',
    variant: 'warning' as ToastVariant,
  },
};

// Post/Comment messages
export const POST_MESSAGES = {
  LIKED: {
    title: 'Liked!',
    description: 'Your reaction has been recorded.',
    variant: 'success' as ToastVariant,
  },
  COMMENT_ADDED: {
    title: 'Comment added!',
    description: 'Your comment has been posted.',
    variant: 'success' as ToastVariant,
  },
  REPLY_ADDED: {
    title: 'Reply added!',
    description: 'Your reply has been posted.',
    variant: 'success' as ToastVariant,
  },
  COMMENT_DELETED: {
    title: 'Comment deleted',
    description: 'Your comment has been successfully deleted.',
    variant: 'success' as ToastVariant,
  },
  REPLY_DELETED: {
    title: 'Reply deleted',
    description: 'Your reply has been successfully deleted.',
    variant: 'success' as ToastVariant,
  },
  LINK_COPIED: {
    title: 'Link Copied!',
    description: 'Post link copied to clipboard.',
    variant: 'success' as ToastVariant,
  },
  LINK_COPY_FAILED: {
    title: 'Failed to copy',
    description: 'Could not copy link to clipboard.',
    variant: 'destructive' as ToastVariant,
  },
};

// Notification messages
export const NOTIFICATION_MESSAGES = {
  NEW_NOTIFICATION: (message: string): ToastMessage => ({
    title: 'New Notification',
    description: message,
    variant: 'info',
  }),
  ALL_READ: {
    title: 'Success',
    description: 'All notifications marked as read',
    variant: 'success' as ToastVariant,
  },
};

// Profile/Selector messages
export const PROFILE_MESSAGES = {
  SWITCHED_TO_ALL: {
    title: 'Switched to All Companies',
    description: 'Previous selections cleared',
    variant: 'info' as ToastVariant,
  },
  SWITCHED_TO_SECTOR: {
    title: 'Switched to Sector Filtering',
    description: 'Company selections cleared',
    variant: 'info' as ToastVariant,
  },
  SWITCHED_TO_COMPANY: {
    title: 'Switched to Company Selection',
    description: 'Sector/subsector selections cleared',
    variant: 'info' as ToastVariant,
  },
  VOTE_RECORDED: {
    title: 'Vote recorded',
    variant: 'success' as ToastVariant,
  },
};

// Validation messages
export const VALIDATION_MESSAGES = {
  FILTER_RANGE_ERROR: (label: string, field: 'From' | 'To', min: number, max: number, unit?: string): ToastMessage => ({
    title: 'Validation Error',
    description: `${label} "${field}" value must be between ${min} and ${max}${unit ? ' ' + unit : ''}`,
    variant: 'warning',
  }),
  FILTER_RANGE_ORDER_ERROR: (label: string): ToastMessage => ({
    title: 'Validation Error',
    description: `${label} "To" value must be greater than or equal to "From" value`,
    variant: 'warning',
  }),
  NO_FILTER_SELECTED: {
    title: 'Validation Error',
    description: 'Please select at least one filter or company/sector/subsector',
    variant: 'warning' as ToastVariant,
  },
  FEED_NAME_REQUIRED: {
    title: 'Validation Error',
    description: 'Please enter a feed name',
    variant: 'warning' as ToastVariant,
  },
  RATING_REQUIRED: {
    title: 'Rating required',
    description: 'Please select a rating before submitting.',
    variant: 'warning' as ToastVariant,
  },
  FEEDBACK_REQUIRED: {
    title: 'Feedback required',
    description: 'Please answer at least one question.',
    variant: 'warning' as ToastVariant,
  },
};

// Settings/Account messages
export const SETTINGS_MESSAGES = {
  FEEDBACK_SUCCESS: {
    title: 'Thank you!',
    description: 'Your feedback has been submitted successfully.',
    variant: 'success' as ToastVariant,
  },
  FEEDBACK_FAILED: {
    title: 'Submission failed',
    description: 'Please try again later.',
    variant: 'destructive' as ToastVariant,
  },
  ACCOUNT_DELETED: {
    title: 'Account deleted',
    description: 'Your account has been permanently deleted.',
    variant: 'success' as ToastVariant,
  },
  ACCOUNT_DELETE_FAILED: {
    title: 'Deletion failed',
    description: 'Please try again later.',
    variant: 'destructive' as ToastVariant,
  },
};

// Generic error messages
export const ERROR_MESSAGES = {
  LOAD_FAILED: (resource: string): ToastMessage => ({
    title: `Failed to load ${resource}`,
    variant: 'destructive',
  }),
  GENERIC_ERROR: {
    title: 'Error',
    description: 'Something went wrong. Please try again.',
    variant: 'destructive' as ToastVariant,
  },
};
