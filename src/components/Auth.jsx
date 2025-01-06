import React, { useState } from 'react';
    import supabase from '../supabase';
    import { useNavigate } from 'react-router-dom';
    import '../index.css';

    function Auth() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const navigate = useNavigate();

      const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) {
            setError(error.message);
          } else {
            navigate('/');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            setError(error.message);
          } else {
            navigate('/');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="auth-container">
          <h1>用户认证</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSignUp} className="auth-form">
            <div className="form-group">
              <label>邮箱:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>密码:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
          <form onSubmit={handleSignIn} className="auth-form">
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      );
    }

    export default Auth;
