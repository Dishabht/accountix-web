import type { ReactNode } from 'react';
import { Suspense } from 'react';

interface LazyWrapperProps {
  children: ReactNode;
}

const LazyFallback = () => (
  <div className="h-24 animate-pulse rounded-md border border-slate-200 bg-slate-50" />
);

const LazyWrapper = ({ children }: LazyWrapperProps) => {
  return <Suspense fallback={<LazyFallback />}>{children}</Suspense>;
};

export default LazyWrapper;
