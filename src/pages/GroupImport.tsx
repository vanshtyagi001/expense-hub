import { Routes, Route } from 'react-router-dom';
import ImportDropzone from '../components/import/ImportDropzone';
import { AnomalyTable } from '../components/import/AnomalyTable';

export default function GroupImport() {
  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-normal tracking-tight">Import Expenses</h2>
        <p className="text-gray-500">Upload a CSV file to automatically reconcile expenses, detect anomalies, and apply splits.</p>
      </div>

      <Routes>
        <Route index element={<ImportDropzone />} />
        <Route path=":sessionId" element={<AnomalyTable />} />
      </Routes>
    </div>
  );
}
