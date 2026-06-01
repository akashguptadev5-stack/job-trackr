import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Pre-typed hooks — no need to specify types at every usage
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);