import React, { useState, useEffect } from 'react';
    import { Routes, Route, useNavigate } from 'react-router-dom';
    import Tracker from './components/Tracker';
    import History from './components/History';
    import Auth from './components/Auth';
    import supabase from './supabase';

    function App() {
      const [session, setSession] = useState(null);
      const navigate = useNavigate();

      useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });
      }, []);

      const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      };

      return (
        <>
          {session ? (
            <>
              <button onClick={handleSignOut}>登出</button>
              <Routes>
                <Route path="/" element={<Tracker />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </>
          ) : (
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Auth />} />
            </Routes>
          )}
        </>
      );
    }

    export default App;
