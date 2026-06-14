import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { AddExpenseDialog } from '../../components/AddExpenseDialog';
import { Button } from '../../components/ui/button';

export default function GroupExpenses() {
  const { groupId } = useParams();
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);

  const fetchExp = async () => {
      try {
          const res = await fetch(`/api/groups/${groupId}/expenses`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setExpenses(data.expenses);
          }
      } catch(err) {}
  };

  useEffect(() => {
      if (token && groupId) fetchExp();
  }, [token, groupId]);

  const handleExport = () => {
     const csvRows = [];
     const headers = ['Date', 'Description', 'Payer', 'Total Amount', 'Currency', 'Exchange Rate', 'Split Type'];
     csvRows.push(headers.join(','));
     
     for (const exp of expenses) {
         const row = [
             format(new Date(exp.date), 'yyyy-MM-dd'),
             `"${exp.description}"`,
             `"${exp.paidBy?.name}"`,
             exp.amount,
             exp.currency,
             exp.exchangeRate || '1',
             exp.splitType
         ];
         csvRows.push(row.join(','));
     }

     const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `group_expenses_${groupId}.csv`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 animate-in fade-in">
       <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-normal tracking-tight">Expenses</h2>
           <div className="flex items-center gap-3">
             <Button variant="outline" onClick={handleExport} className="rounded-full">
               Export CSV
             </Button>
             <AddExpenseDialog onExpenseAdded={fetchExp} />
           </div>
       </div>

       <div className="border border-gray-100 rounded-2xl overflow-hidden">
           <Table>
               <TableHeader className="bg-gray-50">
                   <TableRow>
                       <TableHead>Date</TableHead>
                       <TableHead>Description</TableHead>
                       <TableHead>Paid By</TableHead>
                       <TableHead>Split Type</TableHead>
                       <TableHead className="text-right">Amount</TableHead>
                   </TableRow>
               </TableHeader>
               <TableBody>
                   {expenses.map((exp: any) => (
                       <TableRow key={exp.id}>
                           <TableCell className="text-gray-500">{format(new Date(exp.date), 'MMM d, yyyy')}</TableCell>
                           <TableCell className="font-medium">
                               {exp.description}
                               {exp.currency === 'USD' && <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">USD ${parseFloat(exp.amount).toFixed(2)} @ {exp.exchangeRate}</span>}
                           </TableCell>
                           <TableCell>{exp.paidBy?.name}</TableCell>
                           <TableCell>
                               <Badge variant="outline" className="capitalize text-xs font-normal bg-gray-50">
                                   {exp.splitType}
                               </Badge>
                           </TableCell>
                           <TableCell className="text-right font-medium">₹{parseFloat(exp.amountInr).toLocaleString('en-IN')}</TableCell>
                       </TableRow>
                   ))}
                   {expenses.length === 0 && (
                       <TableRow>
                           <TableCell colSpan={5} className="text-center py-8 text-gray-500 hover:bg-transparent">
                               No expenses logged yet.
                           </TableCell>
                       </TableRow>
                   )}
               </TableBody>
           </Table>
       </div>
    </div>
  );
}
