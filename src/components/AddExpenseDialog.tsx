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
    
    const splitAmount = amountInr / activeMembers.length;
    
    const splits = activeMembers.map(m => ({
        userId: m.userId,
        amount: splitAmount
    }));

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
                splitType: 'equal',
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
