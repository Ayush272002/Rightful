'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { Header } from '@/components/custom/Header';
import { Footer } from '@/components/custom';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('url', url);
    formData.append('description', description);
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set content type for file upload
        },
      });

      console.log('Success:', response.data);
      alert('Form submitted successfully!');
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto p-4 max-w-md">
          <div className="container mx-auto">
              {!isConnected ? (
                <div className="text-center py-16">
                  <h2 className="heading-medium mb-4 text-red-600">
                    Please connect your wallet to access your dashboard
                  </h2>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-4">Submit Form</h1>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file">Upload File</Label>
                      <div
                        className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <input
                          id="file-input"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          {fileName ? fileName : 'Click to upload a file'}
                        </p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                </>
              )}
          </div>
        </main>
        <Footer />
    </div>
  );
}
