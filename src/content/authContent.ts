import type { AuthRole, AuthSuccessFlow } from '../types/auth';

export const authContent = {
  showcase: {
    eyebrow: 'Workspace',
    title: 'Courier operations',
    description:
      'Sign in and continue where your work left off.',
    cards: {
      user: {
        label: 'Focused access',
        title: 'Simple sign in for the right role.',
        description: 'Choose the correct role and continue into the dashboard.',
      },
      employee: {
        label: 'Operations workspace',
        title: 'Claim orders, update routes, and complete deliveries.',
        description:
          'Employees sign in to manage available jobs, active assignments, and final delivery updates.',
      },
    },
    badges: [],
  },
  login: {
    eyebrow: 'Sign in',
    title: {
      user: 'User login',
      employee: 'Employee login',
    },
    description:
      '',
    toggle: {
      user: 'User Login',
      employee: 'Employee Login',
    },
    fields: {
      email: 'Email address',
      password: 'Password',
    },
    placeholders: {
      user: {
        email: 'customer@example.com',
      },
      employee: {
        email: 'employee@example.com',
      },
      password: 'Enter your password',
    },
    passwordActions: {
      show: 'Show',
      hide: 'Hide',
    },
    submit: {
      user: 'Sign in as user',
      employee: 'Sign in as employee',
      loading: 'Signing you in...',
    },
    registrationLabel: 'Need a new account?',
    registrationActions: {
      user: 'User Registration',
      employee: 'Employee Registration',
    },
  },
  registration: {
    title: {
      user: 'Create a user account',
      employee: 'Register a new employee',
    },
    description: {
      user: 'Set up the details needed to book and track courier orders.',
      employee: 'Set up the details needed to receive and manage delivery work.',
    },
    fields: {
      firstname: 'First name',
      lastname: 'Last name',
      email: 'Email address',
      phone: 'Phone number',
      password: 'Password',
      confirmPassword: 'Confirm password',
    },
    placeholders: {
      firstname: 'Enter first name',
      lastname: 'Enter last name',
      email: 'Enter email address',
      phone: 'Enter phone number',
      password: 'Create a password',
      confirmPassword: 'Re-enter the password',
    },
    submit: {
      user: 'Create user account',
      employee: 'Create employee account',
      loading: 'Creating account...',
    },
    backToLogin: 'Back to login',
  },
  success: {
    eyebrow: {
      login: 'Login successful',
      registration: 'Registration successful',
    },
    title: {
      login: {
        user: 'User login successful.',
        employee: 'Employee login successful.',
      },
      registration: {
        user: 'User registration successful.',
        employee: 'Employee registration successful.',
      },
    },
    description: {
      login: {
        user: 'Your session is ready. Continue to the user workspace to start managing shipments.',
        employee:
          'Your session is ready. Continue to the employee workspace to start handling active deliveries.',
      },
      registration: {
        user: 'The account is ready. Return to the login page and sign in with the new user credentials.',
        employee:
          'The account is ready. Return to the login page and sign in with the new employee credentials.',
      },
    },
    actions: {
      continueToDashboard: {
        user: 'Open user workspace',
        employee: 'Open employee workspace',
      },
      returnToLogin: 'Return to login',
    },
  },
  dashboard: {
    eyebrow: 'Access confirmed',
    title: {
      user: 'User workspace is unlocked.',
      employee: 'Employee workspace is unlocked.',
    },
    description:
      'This temporary dashboard confirms that the role-based login flow is working end to end before we build the next screens.',
    labels: {
      signedInAs: 'Signed in as',
      role: 'Role',
    },
    actions: {
      logout: 'Logout',
      backToLogin: 'Back to login',
    },
  },
  errors: {
    login: {
      invalidUser: 'We could not find an account with that email address.',
      invalidPassword: 'The password you entered is incorrect.',
      missingToken: 'Login worked, but the server did not return an access token.',
      generic: 'We could not sign you in right now. Please try again.',
    },
    registration: {
      duplicate: {
        user: 'A user account with that email already exists. Try signing in instead.',
        employee: 'An employee account with that email already exists. Try signing in instead.',
      },
      passwordMismatch: 'Password and confirm password must match.',
      generic: 'We could not create the account right now. Please try again.',
    },
  },
} as const;

export function getFriendlyLoginError(message?: string) {
  if (!message) {
    return authContent.errors.login.generic;
  }

  if (message === 'missing-token') {
    return authContent.errors.login.missingToken;
  }

  if (message.includes('Invalid mail Id')) {
    return authContent.errors.login.invalidUser;
  }

  if (message.includes('Password not Matched')) {
    return authContent.errors.login.invalidPassword;
  }

  return message;
}

export function getFriendlyRegistrationError(_role: AuthRole, message?: string) {
  if (!message) {
    return authContent.errors.registration.generic;
  }

  if (message.includes('already exist')) {
    return message;
  }

  return message;
}

export function getSuccessCopy(flow: AuthSuccessFlow, role: AuthRole) {
  return {
    eyebrow: authContent.success.eyebrow[flow],
    title: authContent.success.title[flow][role],
    description: authContent.success.description[flow][role],
  };
}
