import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';

export function AddExpenseDialog({ onExpenseAdded }: { onExpenseAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const { groupId } = useParams();
  const { token, currentUser } = useAuth();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('83.00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [splitType, setSplitType] = useState('equal');
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});
  
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (open && token && groupId) {
      fetchMembers();
    }
  }, [open, token, groupId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMembers(await res.json());
      }
    } catch(err) {}
  };

  const handleSubmit = async (e: import('react').FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || members.length === 0) return;
    
    setLoading(true);
    
    // Filter active members by date for auto-split
    const activeMembers = members.filter(m => {
        const joinDate = new Date(m.joinedAt);
        const expDate = new Date(date);
        return joinDate <= expDate;
    });

    if (activeMembers.length === 0) {
        alert('No active members on this date. Sam says no!');
        setLoading(false);
        return;
    }

    const payer = members.find(m => m.user.email === currentUser?.email) || members[0];
    
    const amountNum = parseFloat(amount);
    let amountInr = amountNum;
    if (currency === 'USD') {
        amountInr = amountNum * parseFloat(exchangeRate || '83.00');
    }
    
    let splits: any[] = [];
    if (splitType === 'equal') {
        const splitAmount = amountInr / activeMembers.length;
        splits = activeMembers.map(m => ({
            userId: m.userId,
            amount: splitAmount
        }));
    } else if (splitType === 'unequal') {
        let currentTotal = 0;
        splits = activeMembers.map(m => {
            const val = parseFloat(splitValues[m.userId] || '0');
            currentTotal += val;
            return { userId: m.userId, Math_val: val };
        });
        
        // Scale values to the local currency amount if entered in original currency
        if (Math.abs(currentTotal - amountNum) > 0.05 && currency === 'USD') {
             // they might have entered exact amounts in USD, scale it to INR
             // actually let them enter exact amounts in the native currency. We'll convert.
             let scale = amountInr / currentTotal;
             splits = splits.map(s => ({ userId: s.userId, amount: s.Math_val * scale }));
        } else {
             // assumed they entered in INR directly or matched perfectly
             let scale = amountInr / currentTotal;
             splits = splits.map(s => ({ userId: s.userId, amount: s.Math_val * scale }));
        }
    } else if (splitType === 'percentage') {
        splits = activeMembers.map(m => {
            const val = parseFloat(splitValues[m.userId] || '0');
            return { userId: m.userId, amount: amountInr * (val / 100), percentage: val };
        });
    } else if (splitType === 'share') {
        let totalShares = 0;
        const mapped = activeMembers.map(m => {
            const val = parseFloat(splitValues[m.userId] || '1'); // Default to 1 share
            totalShares += val;
            return { userId: m.userId, val };
        });
        splits = mapped.map(s => ({ userId: s.userId, amount: amountInr * (s.val / totalShares), shares: s.val }));
    }

    try {
        const res = await fetch(`/api/groups/${groupId}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                description,
                amount,
                currency,
                exchangeRate,
                date: new Date(date).toISOString(),
                paidById: payer.userId,
                splitType: splitType,
                splits,
                notes: ''
            })
        });

        if (res.ok) {
            setOpen(false);
            setDescription('');
            setAmount('');
            onExpenseAdded();
        }
    } catch(err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="rounded-full bg-[#00e013] text-black hover:bg-[#00e013]/90 gap-2 h-10 px-6 shadow-sm" />}>
        <Plus size={16} /> Add Expense
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] p-6 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal tracking-tight">Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="e.g. Dinner at Raj's" 
              className="rounded-2xl h-12"
              required 
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Amount</Label>
              <Input 
                type="number" 
                step="0.01"
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00" 
                className="rounded-2xl h-12"
                required 
              />
            </div>
            <div className="col-span-1 space-y-2">
              <Label>Currency</Label>
              <select 
                value={currency} 
                onChange={e => setCurrency(e.target.value)} 
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          
          {currency === 'USD' && (
            <div className="space-y-2">
                <Label>Exchange Rate (1 USD = X INR)</Label>
                <Input 
                  type="number" 
                  step="0.0001"
                  value={exchangeRate} 
                  onChange={e => setExchangeRate(e.target.value)} 
                  className="rounded-2xl h-12"
                  required 
                />
            </div>
          )}

          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="rounded-2xl h-12"
              required 
            />
          </div>

          <div className="space-y-4 pt-2 border-t border-gray-100">
            <Label className="block">Split Method</Label>
            <div className="grid grid-cols-4 gap-2">
                {['equal', 'unequal', 'percentage', 'share'].map(type => (
                    <Button 
                        key={type}
                        type="button" 
                        variant={splitType === type ? 'default' : 'outline'}
                        onClick={() => setSplitType(type)}
                        className={`h-10 capitalize ${splitType === type ? 'bg-black text-white hover:bg-black/90' : 'border-gray-200 text-gray-600'}`}
                    >
                        {type}
                    </Button>
                ))}
            </div>

            {splitType !== 'equal' && members.length > 0 && (
                <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 max-h-48 overflow-y-auto">
                    {members.filter(m => new Date(m.joinedAt) <= new Date(date)).map(m => (
                        <div key={m.userId} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{m.user.name}</span>
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="number"
                                    step="0.01"
                                    value={splitValues[m.userId] || ''}
                                    onChange={e => setSplitValues({...splitValues, [m.userId]: e.target.value})}
                                    placeholder={splitType === 'percentage' ? '0%' : splitType === 'share' ? '0' : '0.00'}
                                    className="w-24 h-9 rounded-xl text-right"
                                />
                                {splitType === 'percentage' && <span className="text-sm text-gray-500">%</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90 mt-4"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
