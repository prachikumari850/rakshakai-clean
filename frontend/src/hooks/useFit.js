import { useContext } from 'react';
import { FitContext } from '../context/FitContext';

export const useFit = () => useContext(FitContext);