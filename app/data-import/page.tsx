'use client';

import { useState } from 'react';
import DataImporter from '@/components/data/DataImporter';

export default function DataImportPage() {
  const [importedSourceId, setImportedSourceId] = useState<string | null>(null);
  
  const handleImportSuccess = (sourceId: string) => {
    setImportedSourceId(sourceId);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Data Import</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DataImporter onImportSuccess={handleImportSuccess} />
        </div>
        
        <div>
          {importedSourceId ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-800">Import Successful</h3>
              <p className="text-green-700">
                Your data has been imported successfully. Source ID: {importedSourceId}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-lg font-medium">Getting Started</h3>
              <p className="text-gray-600 mb-3">
                Import your CSV data to create a new dataset in the system.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>CSV files should have headers in the first row</li>
                <li>Data will be stored with full mapping information</li>
                <li>All raw data is preserved for high-fidelity traceability</li>
                <li>After import, you can process this data with pipelines</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 