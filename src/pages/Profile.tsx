import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Mail, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, token, logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete user');
      }

      await logout();
      navigate('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Failed to delete account. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User size={24} className="text-black" />
        <h2 className="text-xl md:text-2xl font-medium tracking-tight">Your Profile</h2>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-2xl md:rounded-[32px] bg-white">
        <CardHeader className="pb-4">
          <CardTitle>Account Details</CardTitle>
          <CardDescription>View your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
               <User className="text-gray-500" size={24} />
            </div>
            <div>
               <p className="text-sm font-medium text-gray-500">Email Address</p>
               <p className="font-medium text-black">{currentUser?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-red-100 shadow-sm rounded-2xl md:rounded-[32px] bg-red-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/80">Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account (Testing)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
