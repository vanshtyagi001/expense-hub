import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, PieChart, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Landing() {
  const { currentUser } = useAuth();

  // Redirect authenticated users to the dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 w-full px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="ExpenseHub" className="w-full h-full object-contain rounded-xl" />
            </div>
            <span className="text-xl md:text-2xl font-medium tracking-tight">ExpenseHub</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/login" className="text-sm font-medium hover:opacity-70 transition-opacity">
              Log in
            </Link>
            <Button render={<Link to="/register" />} className="rounded-full px-4 md:px-6 h-9 md:h-10 text-sm bg-black text-white hover:bg-black/80" nativeButton={false}>
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="px-4 py-8 md:py-24 max-w-7xl mx-auto">
          <div className="bg-[#00e013] rounded-[40px] md:rounded-[80px] p-6 py-12 sm:p-10 md:p-20 flex flex-col items-center text-center shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-normal tracking-tight max-w-4xl text-black leading-tight md:leading-[1.1] mb-4 md:mb-6">
              Split expenses.<br className="md:hidden" /> Settle up.<br className="hidden md:block" /> Keep friendships.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-black/80 max-w-2xl mb-8 md:mb-12 font-medium px-2">
              The transparent, audit-friendly way to manage shared costs. Handle imperfect real-world data with complete clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button render={<Link to="/register" />} className="rounded-full px-8 h-14 bg-black text-white hover:bg-black/80 text-lg w-full sm:w-auto" nativeButton={false}>
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            {/* Hero Image / Mockup abstraction */}
            <div className="mt-12 md:mt-16 w-full max-w-3xl bg-white/20 backdrop-blur-md border border-white/30 rounded-[32px] p-3 md:p-6 shadow-2xl">
              <div className="bg-white rounded-[24px] shadow-sm w-full overflow-hidden p-6 md:p-10 text-left">
                 <div className="flex items-center justify-between mb-6 md:mb-8">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-[#00e013]/20 rounded-full flex items-center justify-center text-[#00e013]">
                       <PieChart size={24} className="md:w-8 md:h-8" />
                   </div>
                   <div className="text-right">
                     <span className="text-xs md:text-sm text-gray-500 font-medium">Your Balance</span>
                     <div className="text-2xl md:text-3xl font-bold tracking-tight">₹2,430</div>
                   </div>
                 </div>
                 <div className="space-y-4">
                    <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                    <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded-full w-5/6"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-14 h-14 bg-black text-white rounded-[20px] flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-tight">Financial Transparency</h3>
              <p className="text-gray-500">Every balance is completely explainable. Trace exactly who owes who, down to the final cent.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
               <div className="w-14 h-14 bg-black text-white rounded-[20px] flex items-center justify-center mb-6">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-tight">CSV Anomaly Detection</h3>
              <p className="text-gray-500">Import messy real-world data securely. Our engine catches duplicates and mismatched currencies.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
               <div className="w-14 h-14 bg-black text-white rounded-[20px] flex items-center justify-center mb-6">
                <PieChart size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-tight">Smart Debt Simplification</h3>
              <p className="text-gray-500">Calculates the minimum number of payments required to settle all debts in the group.</p>
            </div>
          </div>
        </section>

        {/* Cta Section */}
        <section className="px-4 pb-24 max-w-7xl mx-auto">
          <div className="bg-black rounded-[40px] md:rounded-[80px] p-8 py-14 md:p-12 text-center shadow-md">
            <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-white mb-6 md:mb-8">
              Ready to clear the tab?
            </h2>
            <Button render={<Link to="/register" />} className="rounded-full px-8 h-14 bg-[#00e013] text-black hover:bg-[#00e013]/90 text-lg w-full sm:w-auto" nativeButton={false}>
              Create your free account
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-6 h-6">
                <img src="/logo.png" alt="ExpenseHub" className="w-full h-full object-contain grayscale opacity-60" />
             </div>
             <span>© 2026 ExpenseHub. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
