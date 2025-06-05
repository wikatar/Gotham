'use client';

import { useState } from 'react';
import Button from '../../app/components/ui/Button';
import Card from '../../app/components/ui/Card';
import { Upload, FileText, Database, Globe } from 'lucide-react';

// Simple toast function
const toast = ({ title, description, variant }: { 
  title: string; 
  description: string; 
  variant?: string;
}) => {
  console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`)
  // In a real app, this would show a proper toast notification
}

interface DataImporterProps {
  onSourceImported?: () => void;
}

export default function DataImporter({ onSourceImported }: DataImporterProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV or JSON file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, '')); // Remove extension

      const response = await fetch('/api/data/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Import successful',
          description: `Imported ${result.recordCount} records from ${file.name}`
        });
        
        if (onSourceImported) {
          onSourceImported();
        }
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload Data File</h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your CSV or JSON file here, or click to browse
        </p>
        
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        
        <label htmlFor="file-upload">
          <Button
            variant="primary"
            disabled={uploading}
            className="cursor-pointer"
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </label>
        
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: CSV, JSON (max 10MB)
        </p>
      </div>

      {/* Data Source Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
          <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h4 className="font-medium mb-1">CSV Files</h4>
          <p className="text-sm text-gray-600">
            Comma-separated values with headers
          </p>
        </div>
        
        <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
          <Database className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h4 className="font-medium mb-1">JSON Data</h4>
          <p className="text-sm text-gray-600">
            Structured JSON objects or arrays
          </p>
        </div>
        
        <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer opacity-50">
          <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <h4 className="font-medium mb-1">API Endpoints</h4>
          <p className="text-sm text-gray-600">
            Coming soon
          </p>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 p-4 rounded">
        <h4 className="font-medium mb-2">Upload Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Ensure your CSV file has column headers in the first row</li>
          <li>• JSON files should contain an array of objects or a single object</li>
          <li>• File size limit is 10MB for optimal performance</li>
          <li>• Special characters in column names will be normalized</li>
          <li>• Data types will be automatically detected and converted</li>
        </ul>
      </div>
    </div>
  );
} 