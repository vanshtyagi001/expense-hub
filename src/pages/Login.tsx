import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: import('react').FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00e013] p-4 text-black font-sans">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-[32px] overflow-hidden">
        <CardHeader className="space-y-1 pb-8 pt-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-black flex items-center justify-center mb-4">
             <span className="text-[#00e013] font-bold font-mono text-xl">EH</span>
          </div>
          <CardTitle className="text-3xl font-normal tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-black/60">
            Sign in to ExpenseHub.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-10">
            <Button 
              type="submit" 
              className="w-full rounded-full h-14 text-lg bg-black text-white hover:bg-black/90 transition-all font-medium" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm text-black/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-black font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
