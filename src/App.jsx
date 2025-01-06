import React from 'react';
    import { Routes, Route } from 'react-router-dom';
    import Tracker from './components/Tracker';
    import History from './components/History';

    function App() {
      return (
        <Routes>
          <Route path="/" element={<Tracker />} />
          <Route path="/history" element={<History />} />
        </Routes>
      );
    }

    export default App;
