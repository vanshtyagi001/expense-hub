import { useState, useEffect } from 'react';
import { useParams, Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { LoaderCircle } from 'lucide-react';
import GroupImport from './GroupImport';

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current tab from URL path
  const currentTab = location.pathname.split('/').pop() === groupId ? 'overview' : location.pathname.split('/').pop();

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId, token]);

  const fetchGroupDetails = async () => {
    if (!token || !groupId) return;
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroup(data);
      }
    } catch (error) {
      console.error('Failed to fetch group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      navigate(`/groups/${groupId}`);
    } else {
      navigate(`/groups/${groupId}/${value}`);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><LoaderCircle className="animate-spin text-[#00e013]" /></div>;
  if (!group) return <div className="text-center p-12">Group not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-normal tracking-tight mb-2">{group.name}</h1>
        <p className="text-lg text-gray-500">{group.description}</p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-white rounded-full p-1 h-auto mb-8 shadow-sm">
          <TabsTrigger value="overview" className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white">Expenses</TabsTrigger>
          <TabsTrigger value="balances" className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white">Balances</TabsTrigger>
          <TabsTrigger value="members" className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white">Members</TabsTrigger>
          <TabsTrigger value="import" className="rounded-full px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white">Import CSV</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <Routes>
            <Route index element={<div className="bg-white p-8 rounded-[32px] shadow-sm">Overview Content coming soon...</div>} />
            <Route path="expenses" element={<div className="bg-white p-8 rounded-[32px] shadow-sm">Expenses Content coming soon...</div>} />
            <Route path="balances" element={<div className="bg-white p-8 rounded-[32px] shadow-sm">Balances Content coming soon...</div>} />
            <Route path="members" element={<div className="bg-white p-8 rounded-[32px] shadow-sm">Members Content coming soon...</div>} />
            <Route path="import/*" element={<GroupImport />} />
          </Routes>
        </div>
      </Tabs>
    </div>
  );
}
