import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function GroupMembers() {
  const { groupId } = useParams();
  const { token, currentUser } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    if (!token || !groupId) return;
    try {
        const res = await fetch(`/api/groups/${groupId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setMembers(await res.json());
    } catch(err) {}
  };

  useEffect(() => {
     fetchMembers();
  }, [token, groupId]);

  const handleAddMember = async (e: React.FormEvent) => {
      e.preventDefault();
      setAdding(true);
      setError('');
      try {
          const res = await fetch(`/api/groups/${groupId}/members`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ email: newEmail })
          });
          if (res.ok) {
              setNewEmail('');
              setIsAddOpen(false);
              fetchMembers();
          } else {
              const data = await res.json();
              setError(data.error || 'Failed to add member');
          }
      } catch (err) {
          setError('Network error');
      } finally {
          setAdding(false);
      }
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 animate-in fade-in">
       <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-normal tracking-tight">Members</h2>
           
           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
               <DialogTrigger asChild>
                   <Button className="rounded-full bg-[#00e013] text-black hover:bg-[#00e013]/90 gap-2 h-10 px-6 shadow-sm">
                       <Plus size={16} /> Add Member
                   </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px] rounded-[32px] p-6 border-0 shadow-2xl">
                   <DialogHeader>
                       <DialogTitle className="text-2xl font-normal">Add Member</DialogTitle>
                   </DialogHeader>
                   <form onSubmit={handleAddMember} className="space-y-6 pt-4">
                       {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}
                       <div className="space-y-2">
                           <Label htmlFor="email">User Email</Label>
                           <Input 
                               id="email" 
                               type="email"
                               value={newEmail} 
                               onChange={(e) => setNewEmail(e.target.value)} 
                               placeholder="friend@example.com" 
                               required
                               className="rounded-xl h-12"
                           />
                       </div>
                       <Button type="submit" disabled={adding} className="w-full h-14 rounded-full bg-black text-white hover:bg-black/90 text-lg border-0">
                           {adding ? 'Adding...' : 'Add to Group'}
                       </Button>
                   </form>
               </DialogContent>
           </Dialog>

       </div>

       <div className="border border-gray-100 rounded-2xl overflow-hidden">
           <Table>
               <TableHeader className="bg-gray-50">
                   <TableRow>
                       <TableHead>Name</TableHead>
                       <TableHead>Email</TableHead>
                       <TableHead>Role</TableHead>
                       <TableHead>Joined / Left</TableHead>
                   </TableRow>
               </TableHeader>
               <TableBody>
                   {members.map((m: any) => (
                       <TableRow key={m.id}>
                           <TableCell className="font-medium">
                               {m.user.name} 
                               {m.user.email === currentUser?.email && <span className="ml-2 text-xs text-gray-400 font-normal">(You)</span>}
                           </TableCell>
                           <TableCell className="text-gray-500">{m.user.email}</TableCell>
                           <TableCell className="text-gray-500">{m.role}</TableCell>
                           <TableCell className="text-gray-500 text-sm">
                               {format(new Date(m.joinedAt), 'MMM d, yyyy')} - {m.leftAt ? format(new Date(m.leftAt), 'MMM d, yyyy') : 'Present'}
                           </TableCell>
                       </TableRow>
                   ))}
               </TableBody>
           </Table>
       </div>
    </div>
  );
}
