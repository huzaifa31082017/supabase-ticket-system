import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';


export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Define these functions so the buttons have something to call!
  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  }

  // ... keep your handleSignUp and handleLogin functions ...

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Welcome to NagarSeva</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        
        <div className="button-group">
          <button onClick={handleLogin} disabled={loading}>Login</button>
          <button onClick={handleSignUp} disabled={loading} className="secondary">Sign Up</button>
        </div>
      </div>
    </div>
  );
}