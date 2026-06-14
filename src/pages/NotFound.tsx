import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white font-sans text-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-[#00e013]/20 rounded-full flex items-center justify-center mb-8 mb-6">
        <span className="text-3xl font-bold font-mono text-[#00e013]">404</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-normal tracking-tight mb-6">Page not found</h1>
      <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button render={<Link to="/" />} className="rounded-full px-8 h-14 bg-black text-white hover:bg-black/80 text-lg" nativeButton={false}>
        <ArrowLeft className="mr-2 w-5 h-5" /> Go Home
      </Button>
    </div>
  );
}
