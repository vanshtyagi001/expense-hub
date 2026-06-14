import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowUpRight, ArrowDownRight, HandCoins } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function GroupBalances() {
  const { groupId } = useParams();
  const { token, currentUser } = useAuth();
  const [balances, setBalances] = useState<any>(null);

  const fetchBalances = async () => {
    if (!token || !groupId) return;
    try {
        const res = await fetch(`/api/groups/${groupId}/balances`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setBalances(await res.json());
    } catch(err) {}
  };

  useEffect(() => {
     fetchBalances();
  }, [token, groupId]);

  const handleSettle = async (fromId: string, toId: string, amount: string) => {
     try {
         const res = await fetch(`/api/groups/${groupId}/settlements`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({
                 fromUserId: fromId,
                 toUserId: toId,
                 amount: amount,
                 date: new Date().toISOString()
             })
         });
         if (res.ok) fetchBalances();
     } catch (err) {}
  };

  return (
    <div className="space-y-8 animate-in fade-in">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-normal tracking-tight mb-6">Net Balances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {balances?.memberBalances?.map((b: any) => (
                    <Card key={b.userId} className="rounded-2xl border-0 shadow-sm bg-gray-50/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-gray-400">
                                   {b.name.charAt(0)}
                                </div>
                                <div className="font-medium">
                                    {b.name}
                                    {b.email === currentUser?.email && <span className="ml-2 text-xs text-gray-400 font-normal">(You)</span>}
                                </div>
                            </div>
                            <div className={`font-medium ${b.netBalance > 0 ? 'text-[#00e013]' : b.netBalance < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {b.netBalance > 0 ? '+' : b.netBalance < 0 ? '-' : ''}₹{Math.abs(b.netBalance).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00e013]/10 flex items-center justify-center text-[#00e013]">
                    <HandCoins size={20} />
                </div>
                <h2 className="text-2xl font-normal tracking-tight">Suggested Settlements</h2>
            </div>

            <div className="space-y-4">
                {balances?.settlementPlan?.map((plan: any, i: number) => {
                    const isMyDebt = balances?.memberBalances?.find((m: any) => m.userId === plan.fromUserId)?.email === currentUser?.email;
                    
                    return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-[#00e013] transition-colors">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{plan.fromName}</span>
                            <span className="text-gray-400 text-sm">pays</span>
                            <span className="font-medium">{plan.toName}</span>
                            <span className="ml-2 font-bold tracking-tight">₹{plan.amount}</span>
                        </div>
                        {isMyDebt && (
                            <Button 
                                onClick={() => handleSettle(plan.fromUserId, plan.toUserId, plan.amount)}
                                className="rounded-full bg-black hover:bg-black/90 text-white"
                            >
                                Record Payment
                            </Button>
                        )}
                    </div>
                )})}
                {balances?.settlementPlan?.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
                        All settled up! No payments required.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
