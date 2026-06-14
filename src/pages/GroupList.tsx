import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Users, Plus, LoaderCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

export default function GroupList() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, currentUser } = useAuth();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const fetchGroups = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc })
      });
      if (res.ok) {
        const newGroup = await res.json();
        setGroups([newGroup, ...groups]);
        setIsCreateOpen(false);
        setNewGroupName('');
        setNewGroupDesc('');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><LoaderCircle className="animate-spin text-[#00e013]" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight mb-2">Groups</h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Manage your shared expense groups here.
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#00e013] text-black hover:bg-[#00e013]/90 gap-2 h-12 px-6 shadow-sm">
              <Plus size={18} /> New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[32px] p-6 border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-normal">Create Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input 
                  id="name" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)} 
                  placeholder="E.g. Flat 4B Trips" 
                  required
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (Optional)</Label>
                <Input 
                  id="desc" 
                  value={newGroupDesc} 
                  onChange={(e) => setNewGroupDesc(e.target.value)} 
                  placeholder="Goa trip expenses" 
                  className="rounded-xl h-12"
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full h-14 rounded-full bg-black text-white hover:bg-black/90 text-lg">
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <Link key={group.id} to={`/groups/${group.id}`}>
            <Card className="rounded-[32px] border-0 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer h-full border hover:border-[#00e013]">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#00e013]/10 flex items-center justify-center mb-4">
                  <Users className="text-[#00e013]" size={24} />
                </div>
                <CardTitle className="text-xl font-medium">{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {group.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-[32px] border border-dashed border-gray-200">
            You don't have any groups yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
