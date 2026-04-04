// frontend/src/context/FitContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  extractAccessTokenFromHash,
  fetchFitData,
  fetchCachedFitData,
  calculateFitRisk,
} from '../services/fitService';
import { useAuth } from './AuthContext';

const FitContext = createContext(null);

export const FitProvider = ({ children }) => {
  const { user } = useAuth();

  const [fitData, setFitData] = useState(null);       // { steps, heartRate, sleepHours, source }
  const [fitRisk, setFitRisk] = useState(null);       // { delta, reasons, sosTrigger }
  const [fitLoading, setFitLoading] = useState(false);
  const [fitError, setFitError] = useState('');
  const [googleToken, setGoogleToken] = useState(     // persist in sessionStorage (tab-only)
    () => sessionStorage.getItem('rakshak_google_token') || ''
  );

  // ── After Google OAuth redirect, extract token from URL hash ──
  useEffect(() => {
    const token = extractAccessTokenFromHash();
    if (token) {
      setGoogleToken(token);
      sessionStorage.setItem('rakshak_google_token', token);
    }
  }, []);

  // ── When we have both a logged-in user and a Google token, fetch data ──
  useEffect(() => {
    if (user && googleToken) {
      syncFitData(googleToken);
    } else if (user) {
      // No Google token yet — try to load cached data from MongoDB
      loadCachedData();
    }
  }, [user, googleToken]); // eslint-disable-line

  // ── Fetch live from Google Fit via backend ─────────────────
  const syncFitData = useCallback(async (token) => {
    setFitLoading(true);
    setFitError('');
    try {
      const data = await fetchFitData(token || googleToken);
      setFitData(data);
      setFitRisk(calculateFitRisk(data));
    } catch (err) {
      setFitError('Could not sync Google Fit data');
      console.error('[FitContext] sync error:', err.message);
    } finally {
      setFitLoading(false);
    }
  }, [googleToken]);

  // ── Load last saved data from MongoDB (no Google call) ─────
  const loadCachedData = useCallback(async () => {
    try {
      const data = await fetchCachedFitData();
      setFitData(data);
      setFitRisk(calculateFitRisk(data));
    } catch {
      // Silently fail — user may not have connected Google Fit yet
    }
  }, []);

  // ── Called when user clicks "Connect Google Fit" ──────────
  const connectGoogleFit = useCallback(() => {
    // Import inline to avoid circular issues
    import('../services/fitService').then(({ buildGoogleOAuthUrl }) => {
      window.location.href = buildGoogleOAuthUrl();
    });
  }, []);

  // ── Disconnect: clear stored token ────────────────────────
  const disconnectGoogleFit = useCallback(() => {
    setGoogleToken('');
    setFitData(null);
    setFitRisk(null);
    sessionStorage.removeItem('rakshak_google_token');
  }, []);

  const isConnected = !!googleToken;

  return (
    <FitContext.Provider value={{
      fitData,
      fitRisk,
      fitLoading,
      fitError,
      isConnected,
      syncFitData,
      connectGoogleFit,
      disconnectGoogleFit,
    }}>
      {children}
    </FitContext.Provider>
  );
};

export const useFit = () => useContext(FitContext);

