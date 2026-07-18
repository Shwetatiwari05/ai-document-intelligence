// src/context/AuthContext.jsx
//
// Mock authentication for now — stores a user object in localStorage.
// When Supabase is wired in, only this file needs to change: keep the
// same shape (user, signUp, signIn, signOut, updatePassword) and every
// page that calls useAuth() keeps working unmodified.

import { supabase } from "../lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext(null);

const STORAGE_KEY = "radix_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
            const u = data.session.user;
            persist({
                id: u.id,
                email: u.email,
                name: u.user_metadata?.name || "",
            });
        }
        setLoading(false);
    });
}, []);

  function persist(nextUser) {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

async function signUp({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;

  if (data.session) {
    const newUser = {
      id: data.user.id,
      email: data.user.email,
      name,
    };

    persist(newUser);
  }

  return {
  emailConfirmationRequired: !data.session,
  user: data.user,
};
}

async function signIn({ email, password }) {

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password,
        });

    if (error) throw error;

    const loggedInUser = {

        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || "",

    };

    persist(loggedInUser);
    return loggedInUser;
}

async function signOut() {
    await supabase.auth.signOut();
    persist(null);
}

  async function updateProfile(updates) {
    const next = { ...user, ...updates };
    persist(next);
    return next;
  }

  async function updatePassword(_currentPassword, _newPassword) {
    // TODO: replace with supabase.auth.updateUser({ password: newPassword })
    return true;
  }

  async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;

  return true;
}

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    requestPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
