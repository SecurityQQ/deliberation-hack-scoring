import { GetServerSideProps } from 'next';
import { prisma } from '../../lib/prisma';
import { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import WalletButton from '@/components/WalletButton';

// Import the ABI from the compiled contract
import contractABI from '@/artifacts/contracts/CommentPayment.sol/CommentPayment.json';

// Use environment variable for contract address
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
    include: { comments: true },
  });

  // Convert Date objects to strings
  const serializedProject = {
    ...project,
    comments: project.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  };

  return { props: { project: serializedProject } };
};

const Project = ({ project }) => {
  const [content, setContent] = useState('');
  const [weight, setWeight] = useState(1.0);
  const [comments, setComments] = useState(project.comments);
  const [premium, setPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      setPremium(false);
    }
  }, [isConnected]);

  const addComment = async () => {
    if (!isConnected) return alert('Please connect your wallet.');

    // Check if the user is the owner
    if (project.owner === address) {
      return alert('You cannot comment on your own project.');
    }

    setIsLoading(true);

    const res = await fetch(`/api/projects/${project.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, wallet: address, weight, premium }),
    });

    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      return alert(data.message);
    }

    const newComment = await res.json();
    setComments([...comments, newComment]);
    setContent('');
  };

  const handlePayment = async () => {
    if (!isConnected) return alert('Please connect your wallet.');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

    try {
      const tx = await contract.payForComments({
        value: ethers.utils.parseEther("0.02"),
      });

      await tx.wait();
      setPremium(true);
      alert('Payment successful, you can now post premium comments.');
    } catch (error) {
      console.error(error);
      alert('Payment failed.');
    }
  };

  const handlePowerUp = async () => {
    if (!isConnected) return alert('Please connect your wallet.');

    const amount = prompt('Enter the amount in ETH to power up your comment:');
    if (!amount) return;

    const ethAmount = ethers.utils.parseEther(amount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

    try {
      const tx = await contract.powerUpComment({
        value: ethAmount,
      });

      await tx.wait();
      setWeight(weight + parseFloat(amount) * 10);
      alert('Power up successful.');
    } catch (error) {
      console.error(error);
      alert('Power up failed.');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
        <img src={project.image} alt={project.title} className="w-full h-48 object-cover rounded-lg mb-4" />
        <p className="mb-4">{project.description}</p>
        <p className="mb-4"><strong>Owner:</strong> {project.owner}</p>

        <h3 className="font-semibold">Comments:</h3>
        <ul>
          {comments.map((comment) => (
            <li key={comment.id} className="border-t mt-2 pt-2">{comment.content} (Weight: {comment.weight})</li>
          ))}
        </ul>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment"
          className="border rounded w-full p-2 mt-4"
          disabled={isLoading}
        ></textarea>
        <button
          onClick={addComment}
          className="bg-blue-500 text-white rounded px-4 py-2 mt-2"
          disabled={isLoading}
        >
          {isLoading ? 'Adding Comment...' : 'Add Comment'}
        </button>
        <button
          onClick={handlePayment}
          className="bg-green-500 text-white rounded px-4 py-2 mt-2"
          disabled={isLoading}
        >
          {isLoading ? 'Processing Payment...' : 'Pay for Premium Comments'}
        </button>
        <button
          onClick={handlePowerUp}
          className="bg-purple-500 text-white rounded px-4 py-2 mt-2"
          disabled={isLoading}
        >
          {isLoading ? 'Powering Up...' : 'Power Up Comment'}
        </button>
        {!isConnected && <WalletButton />}
      </div>
    </Layout>
  );
};

export default Project;
