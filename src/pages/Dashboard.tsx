import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-normal tracking-tight mb-2">Hello, {currentUser?.displayName || 'there'}</h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Welcome to ExpenseHub. Track expenses, manage changing group memberships, and settle balances transparently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-[32px] border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Wallet className="text-[#00e013]" size={20} />
            </div>
            <CardTitle className="text-sm font-medium text-gray-500">Total Balance (across groups)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-medium tracking-tight">₹0.00</div>
            <p className="text-xs text-gray-500 mt-1">You are settled up</p>
          </CardContent>
        </Card>
        
        {/* Placeholder for more summary cards */}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium tracking-tight">Your Groups</h2>
          <Button render={<Link to="/groups" />} variant="outline" className="rounded-full" nativeButton={false}>
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/groups">
            <div className="p-6 rounded-[32px] border-2 border-dashed border-gray-200 hover:border-[#00e013] hover:bg-green-50/50 transition-colors flex flex-col items-center justify-center text-center h-48 gap-4">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                +
              </div>
              <div className="font-medium">Create a new group</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
