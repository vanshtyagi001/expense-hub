import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowUpRight, ArrowDownRight, Wallet, Users } from 'lucide-react';

export default function GroupOverview() {
  const { groupId } = useParams();
  const { token, currentUser } = useAuth();
  const [balances, setBalances] = useState<any>(null);
  
  useEffect(() => {
      const fetchBalances = async () => {
          try {
              const res = await fetch(`/api/groups/${groupId}/balances`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) setBalances(await res.json());
          } catch(err) {}
      };
      if (token && groupId) fetchBalances();
  }, [token, groupId]);

  const myBalance = balances?.memberBalances?.find((m: any) => m.email === currentUser?.email)?.netBalance || 0;

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 animate-in fade-in">
       <h2 className="text-2xl font-normal tracking-tight mb-6">Group Overview</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="rounded-[24px] border-0 shadow-sm bg-gray-50 overflow-hidden">
                <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 text-black shadow-sm">
                       <Wallet size={20} />
                    </div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Your Balance</div>
                    <div className="text-3xl font-medium tracking-tight">
                       {myBalance === 0 ? '₹0.00' : 
                          myBalance > 0 ? <span className="text-[#00e013] flex items-center gap-1"><ArrowUpRight size={24} /> ₹{Math.abs(myBalance).toFixed(2)}</span> :
                                          <span className="text-red-500 flex items-center gap-1"><ArrowDownRight size={24} /> ₹{Math.abs(myBalance).toFixed(2)}</span>
                       }
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {myBalance > 0 ? 'You are owed money' : myBalance < 0 ? 'You owe money' : 'You are settled up'}
                    </p>
                </CardContent>
            </Card>

            <Card className="rounded-[24px] border-0 shadow-sm bg-gray-50 overflow-hidden">
                <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 text-black shadow-sm">
                       <Users size={20} />
                    </div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Group Members</div>
                    <div className="text-3xl font-medium tracking-tight">
                        {balances?.memberBalances?.length || 0}
                    </div>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
