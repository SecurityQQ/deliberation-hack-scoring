import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { InputFile } from '@/components/InputFile';
import { useAccount } from 'wagmi';  // Assuming wagmi is used for wallet connection

import Layout from "@/components/Layout";
import { Button } from '@/components/ui/button';


const AddProject = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;
      setImage(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet to submit a project.');
      return;
    }

    try {
      const res = await axios.post('/api/projects', { title, description, image, owner: address });

      if (res.status === 201) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };


  return (
    <Layout >
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Add New Project</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full border p-2 rounded-lg"
              ></textarea>
            </div>
            <div className="mb-4">
              <InputFile onChange={handleImageUpload} />
              {image && (
                <div className="mt-4 relative w-48 h-48">
                  <img src={image} alt="Uploaded image" className="rounded-lg object-cover w-full h-full" />
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              variant="default"
            >
              Add Project
            </Button>
          </form>
        </div>
    </ Layout>
  );
};

export default AddProject;
