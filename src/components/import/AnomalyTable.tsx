import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, CheckCircle, ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function AnomalyTable() {
  const { groupId, sessionId } = useParams();
  const { token } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSession();
  }, [sessionId, token]);

  const fetchSession = async () => {
    if (!token || !sessionId) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/import/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSession(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch session', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAll = async () => {
    // In a real implementation this would allow granular resolutions,
    // for this setup we will just hit the commit endpoint to finish it
    setResolving(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/import/${sessionId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resolutions: session.anomalies.map((a: any) => ({
            anomalyId: a.id,
            action: 'USER_APPROVED'
          }))
        })
      });
      if (res.ok) {
        await commitImport();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  const commitImport = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/import/${sessionId}/commit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        navigate(`/groups/${groupId}/expenses`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><LoaderCircle className="animate-spin text-[#00e013]" /></div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-600" />
          <div>
            <h4 className="font-medium text-yellow-900">Review Anomalies</h4>
            <p className="text-sm text-yellow-800">We detected {session.anomalies.length} flag(s) that need review before importing.</p>
          </div>
        </div>
        <Button onClick={handleResolveAll} disabled={resolving} className="bg-black text-white hover:bg-black/90 rounded-full shrink-0">
          {resolving ? 'Resolving...' : 'Approve All & Import'}
        </Button>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-200">
        <div className="bg-gray-50 p-4 font-medium text-sm text-gray-500 grid grid-cols-12 gap-4">
          <div className="col-span-1">Row</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-4">Original Data</div>
        </div>
        {session.anomalies.map((anomaly: any) => (
          <div key={anomaly.id} className="p-4 grid grid-cols-12 gap-4 text-sm items-center hover:bg-gray-50 transition-colors">
            <div className="col-span-1 font-mono text-gray-500">#{anomaly.rowNumber}</div>
            <div className="col-span-2">
              <Badge variant="outline" className={anomaly.severity === 'ERROR' ? 'text-red-600 border-red-200 bg-red-50' : anomaly.severity === 'WARNING' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 'text-blue-600 border-blue-200 bg-blue-50'}>
                {anomaly.anomalyType}
              </Badge>
            </div>
            <div className="col-span-5 text-gray-700">{anomaly.description}</div>
            <div className="col-span-4">
              <div className="bg-white border rounded border-gray-200 p-2 font-mono text-xs truncate">
                {JSON.stringify(anomaly.originalData)}
              </div>
            </div>
          </div>
        ))}
        {session.anomalies.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            No anomalies detected. File is clean.
          </div>
        )}
      </div>

      {session.anomalies.length === 0 && (
        <Button onClick={commitImport} className="w-full h-14 rounded-full bg-[#00e013] text-black hover:bg-[#00e013]/90 text-lg font-medium shadow-sm transition-all mt-6">
          Approve & Import {session.totalRows} Rows
        </Button>
      )}
    </div>
  );
}
