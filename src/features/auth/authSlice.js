import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  users: [],
  isAuthenticated: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, password, passwordHash } = action.payload;
      const normalizedEmail = email?.toLowerCase().trim();
      let user = state.users.find(u => u.email.toLowerCase() === normalizedEmail);

      // Auto-populate default users if missing
      if (!user) {
        if (normalizedEmail === 'admin@cinemax.com') {
          user = {
            id: 'usr_admin_01',
            name: 'System Administrator',
            email: 'admin@cinemax.com',
            passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
            role: 'ADMIN',
            phone: '+91 98765 43210'
          };
          state.users.push(user);
        } else if (normalizedEmail === 'customer@cinemax.com') {
          user = {
            id: 'usr_customer_01',
            name: 'John Doe',
            email: 'customer@cinemax.com',
            passwordHash: 'b041c0aeb35bb0fa4aa668ca5a920b590196fdaf9a00eb852c9b7f4d123cc6d6',
            role: 'CUSTOMER',
            phone: '+91 91234 56789'
          };
          state.users.push(user);
        } else {
          state.error = 'No user found with this email address.';
          return;
        }
      }

      // Check password validity
      const validAdminInputs = [
        '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // sha256(admin123)
        '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        'demo_hash_39c43b7dx9f',
        'admin123',
        'admin'
      ];

      const validCustomerInputs = [
        'b041c0aeb35bb0fa4aa668ca5a920b590196fdaf9a00eb852c9b7f4d123cc6d6', // sha256(customer123)
        '1f82f2f3d358be85e192ffbcf3f221e7d0a27e85c54d39f60bfb506649779df5',
        'demo_hash_69a0366cx9f',
        'customer123',
        'customer'
      ];

      const matchesStoredHash = (passwordHash && user.passwordHash === passwordHash) || 
                                (password && user.passwordHash === password);

      const matchesAdminDefaults = user.role === 'ADMIN' && (
        validAdminInputs.includes(passwordHash) || validAdminInputs.includes(password)
      );

      const matchesCustomerDefaults = user.role === 'CUSTOMER' && (
        validCustomerInputs.includes(passwordHash) || validCustomerInputs.includes(password)
      );

      if (!matchesStoredHash && !matchesAdminDefaults && !matchesCustomerDefaults) {
        state.error = 'Invalid password. Please check your credentials.';
        return;
      }

      state.currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      };
      state.isAuthenticated = true;
      state.error = null;
    },

    registerCustomer: (state, action) => {
      const { name, email, passwordHash, phone } = action.payload;
      const normalizedEmail = email?.toLowerCase().trim();

      const existing = state.users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        state.error = 'An account with this email already exists.';
        return;
      }

      const newUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'CUSTOMER', // STRICT: customer cannot register as admin
        phone: phone?.trim() || '',
        createdAt: new Date().toISOString()
      };

      state.users.push(newUser);
      state.currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      };
      state.isAuthenticated = true;
      state.error = null;
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },

    // Set demo credentials directly for easy 1-click test button
    quickLoginAs: (state, action) => {
      const role = action.payload; // 'ADMIN' or 'CUSTOMER'
      let targetUser = state.users.find(u => u.role === role);
      if (!targetUser) {
        if (role === 'ADMIN') {
          targetUser = {
            id: 'usr_admin_01',
            name: 'System Administrator',
            email: 'admin@cinemax.com',
            role: 'ADMIN',
            phone: '+91 98765 43210'
          };
          state.users.push(targetUser);
        } else {
          targetUser = {
            id: 'usr_customer_01',
            name: 'John Doe',
            email: 'customer@cinemax.com',
            role: 'CUSTOMER',
            phone: '+91 91234 56789'
          };
          state.users.push(targetUser);
        }
      }

      state.currentUser = {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        phone: targetUser.phone || ''
      };
      state.isAuthenticated = true;
      state.error = null;
    }
  }
});

export const { login, registerCustomer, logout, clearAuthError, quickLoginAs } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.currentUser?.role === 'ADMIN';
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
