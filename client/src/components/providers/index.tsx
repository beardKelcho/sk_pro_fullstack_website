import { PropsWithChildren } from 'react';
import { ErrorProvider } from './ErrorProvider';
import { ThemeProvider } from './ThemeProvider';

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <ErrorProvider>
        {children}
      </ErrorProvider>
    </ThemeProvider>
  );
}; 