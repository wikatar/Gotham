'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import Papa from 'papaparse';

interface DataImporterProps {
  onImportSuccess?: (sourceId: string) => void;
  accountId?: string;
}

export default function DataImporter({ 
  onImportSuccess,
  accountId = 'demo-account' 
}: DataImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to import',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      // Parse CSV file
      const parseResult = await new Promise<Papa.ParseResult<Record<string, string>>>((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject,
        });
      });

      setProgress(40);

      if (parseResult.errors.length > 0) {
        throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`);
      }

      // Create mapping from headers (simple 1:1 mapping initially)
      const headers = parseResult.meta.fields || [];
      const mapping: Record<string, string> = {};
      headers.forEach(header => {
        mapping[header] = header;
      });

      setProgress(60);

      // Send data to the API
      const response = await fetch('/api/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          mapping,
          data: parseResult.data,
          accountId,
        }),
      });

      setProgress(90);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import data');
      }

      const result = await response.json();

      toast({
        title: 'Data imported successfully',
        description: `Imported ${result.recordCount} records from ${file.name}`,
      });

      // Call the success callback with the source ID
      if (onImportSuccess) {
        onImportSuccess(result.sourceId);
      }

      // Reset the file input
      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Import Data</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium mb-1">
            CSV File
          </label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Select a CSV file with headers in the first row
          </p>
        </div>

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? 'Importing...' : 'Import Data'}
        </Button>
      </div>
    </Card>
  );
} 