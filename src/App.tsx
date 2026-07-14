import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import GeneratorApp from './components/GeneratorApp';

export default function App() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <GeneratorApp />;
  }

  return <LandingPage onStart={() => setShowApp(true)} />;
}

