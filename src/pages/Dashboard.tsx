import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Users, Plus, Upload, Wallet, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { currentUser, token } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
        fetch('/api/groups', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => {
            if (Array.isArray(data)) setGroups(data);
            else if (data.groups) setGroups(data.groups);
        })
        .catch(console.error);
    }
  }, [token]);
  
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mobile Hero Balance Card */}
      <div className="w-full h-[220px] bg-[#00e013] rounded-[40px] p-6 text-black flex flex-col justify-between shadow-lg">
        <div>
          <h2 className="text-sm font-medium opacity-80 mb-1">Your Balance</h2>
          <div className="text-4xl md:text-5xl font-semibold tracking-tight">₹0</div>
        </div>
        <div>
          <div className="text-sm font-medium opacity-90">You owe ₹0</div>
          <div className="text-sm font-medium opacity-90">You are owed ₹0</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/groups" className="bg-white border text-center border-gray-100 rounded-[28px] h-[90px] flex flex-col items-center justify-center gap-1 hover:shadow-md transition-shadow">
           <Plus size={22} className="text-black" />
           <span className="text-[13px] font-medium">Add Group</span>
        </Link>
        <div className="bg-white border text-center border-gray-100 rounded-[28px] h-[90px] flex flex-col items-center justify-center gap-1 hover:shadow-md transition-shadow opacity-60">
           <Receipt size={22} className="text-black" />
           <span className="text-[13px] font-medium">Add Expense</span>
        </div>
        <div className="bg-white border text-center border-gray-100 rounded-[28px] h-[90px] flex flex-col items-center justify-center gap-1 hover:shadow-md transition-shadow opacity-60">
           <Wallet size={22} className="text-black" />
           <span className="text-[13px] font-medium">Settle Up</span>
        </div>
        <Link to="/groups" className="bg-black text-white text-center rounded-[28px] h-[90px] flex flex-col items-center justify-center gap-1 hover:bg-black/90 transition-colors">
           <Upload size={22} />
           <span className="text-[13px] font-medium">Import CSV</span>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-medium tracking-tight">Your Groups</h2>
          <Button render={<Link to="/groups" />} variant="ghost" className="rounded-full text-[#00e013] hover:text-black hover:bg-gray-100 px-3 h-8" nativeButton={false}>
             See All
          </Button>
        </div>
        
        {/* Groups List (Vertical layout on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.length === 0 && (
            <div className="p-6 md:col-span-2 lg:col-span-3 rounded-[32px] border-2 border-dashed border-gray-200 text-center h-48 flex flex-col items-center justify-center">
              <span className="text-gray-500 mb-2">No groups yet.</span>
              <Link to="/groups" className="text-[#00e013] font-medium">Create a new group</Link>
            </div>
          )}
          {groups.map(g => (
             <Link key={g.id} to={`/groups/${g.id}`}>
               <div className="p-5 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group cursor-pointer bg-white">
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-3 w-full">
                     <div className="w-12 h-12 shrink-0 rounded-full bg-[#00e013]/20 flex items-center justify-center text-[#00e013]">
                       <Users size={20} />
                     </div>
                     <div className="truncate w-full pr-4">
                       <h3 className="font-semibold text-lg truncate tracking-tight">{g.name}</h3>
                       <p className="text-sm text-gray-500 truncate">{g.description || 'No description'}</p>
                     </div>
                   </div>
                 </div>
                 <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">0 Mem</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight size={14} />
                    </div>
                 </div>
               </div>
             </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
