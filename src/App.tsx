import React from 'react';
import { SerralheriaProvider } from './context/SerralheriaContext';
import { AppLayout } from './components/layout/AppLayout';

export default function App() {
  return (
    <SerralheriaProvider>
      <AppLayout />
    </SerralheriaProvider>
  );
}
