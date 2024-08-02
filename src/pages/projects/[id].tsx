import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { prisma } from '../../lib/prisma';
import Layout from "@/components/Layout";
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, TrendingUp, TrendingDown, CircleSlash } from 'lucide-react';
import { AreaChart, CartesianGrid, XAxis, Area, Tooltip } from 'recharts';
import { PlusIcon, EditIcon } from '@/components/icons';
import RatingSlider from '@/components/RatingSlider';

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as Params;
  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
    include: { comments: true },
  });

  if (!project) {
    return { notFound: true };
  }

  const serializedProject = {
    ...project,
    comments: project.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  };

  return { props: { project: serializedProject } };
};

interface Comment {
  id: number;
  wallet: string;
  content: string;
  weight: number;
  premium: boolean;
  rating: number;
  createdAt: string;
}

interface ProjectProps {
  project: {
    id: number;
    title: string;
    description: string;
    image: string;
    owner: string;
    comments: Comment[];
    deliberationMap: string;
    ratings: Record<string, number>;
  };
}

const Project: React.FC<ProjectProps> = ({ project }) => {
  const { address, isConnected } = useAccount();
  const [content, setContent] = useState('');
  const [comments, setComments] = useState(project.comments);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [boostAmount, setBoostAmount] = useState(1);
  const [rating, setRating] = useState(50);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      const fetchBalance = async () => {
        try {
          const response = await axios.get(`/api/get-balance?wallet=${address}`);
          setBalance(parseFloat(response.data.balance));
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };

      fetchBalance();
    }
  }, [isConnected, address]);

  const fetchDeliberationMap = async () => {
    try {
      const response = await axios.get(`/api/projects/${project.id}/deliberation-map`);
      if (response.data.deliberationMap) {
        project.deliberationMap = response.data.deliberationMap;
      }
    } catch (error) {
      console.error('Error fetching deliberation map:', error);
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isConnected) {
      setErrorMessage('Please connect your wallet.');
      return;
    }

    if (project.owner === address) {
      setErrorMessage('You cannot comment on your own project.');
      return;
    }

    setIsLoading(true);
    const premium = boostAmount > 1;
    const w = boostAmount;

    try {
      const userComments = comments.filter((comment) => comment.wallet === address);
      const isFirstComment = userComments.length === 0;

      if (!isFirstComment) {
        const spendRes = await fetch('/api/spend-balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address, amount: w }),
        });

        if (!spendRes.ok) {
          const spendData = await spendRes.json();
          setErrorMessage(spendData.error);
          setIsLoading(false);
          return;
        }

        const updatedBalance = await spendRes.json();
        setBalance(parseFloat(updatedBalance.balance));
      }

      const res = await fetch(`/api/projects/${project.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, wallet: address, weight: w, premium, rating }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.message);
        setIsLoading(false);
        return;
      }

      const newComment = await res.json();
      setComments([...comments, newComment]);
      setContent('');
      setSuccessMessage('Comment added successfully.');

      setTimeout(() => {
        setSuccessMessage('Updating Deliberation Map');
        fetchDeliberationMap();
      }, 1000);

    } catch (error) {
      setErrorMessage('Failed to add comment.');
    } finally {
      setIsLoading(false);
    }
  };

  const incrementAmount = (e: React.MouseEvent) => {
    e.preventDefault();
    setBoostAmount((prev) => Math.min(prev + balance! / 10, balance!));
  };

  const decrementAmount = (e: React.MouseEvent) => {
    e.preventDefault();
    setBoostAmount((prev) => Math.max(prev - balance! / 10, 1));
  };

  const averageRating = () => {
    if (!project.ratings) return 0;
    const ratings = Object.values(project.ratings);
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const renderRatingIcon = (rating: number) => {
    if (!rating) {
      return <CircleSlash className="text-gray-400" />;
    }
    if (rating >= 50) {
      return <TrendingUp className="text-purple-500" />;
    }
    return <TrendingDown className="text-pink-500" />;
  };

  return (
    <Layout>
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 lg:py-16">
        <ProjectHeader project={project} />
        <DeliberationMap 
          project={project} 
          fetchDeliberationMap={fetchDeliberationMap} 
        />
        <CommentsScore comments={comments} />
        <CommentsSection 
          comments={comments} 
          renderRatingIcon={renderRatingIcon} 
          handlePowerUp={incrementAmount}
        />
        <CommentForm 
          content={content}
          setContent={setContent}
          rating={rating}
          setRating={setRating}
          boostAmount={boostAmount}
          incrementAmount={incrementAmount}
          decrementAmount={decrementAmount}
          balance={balance!}
          addComment={addComment}
          errorMessage={errorMessage}
          successMessage={successMessage}
          isLoading={isLoading}
          isFirstComment={comments.every(comment => comment.wallet !== address)}
        />
      </div>
    </Layout>
  );
};

const ProjectHeader: React.FC<{ project: any }> = ({ project }) => (
  <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
    <div className="md:col-span-2 lg:col-span-1">
      <img
        src={project.image}
        alt={project.title}
        className="w-full h-48 object-cover rounded-lg"
      />
    </div>
    <div className="space-y-4 md:col-span-2 lg:col-span-2">
      <div>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="mt-2 text-muted-foreground">{project.description}</p>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="w-10 h-10 border">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">Crypto Wallet Owner</div>
          <div className="text-sm text-muted-foreground">{project.owner}</div>
        </div>
      </div>
    </div>
  </div>
);

const DeliberationMap: React.FC<any> = ({ project, fetchDeliberationMap }) => {
  // Regular expression to match the initial markdown block
  const cleanedDeliberationMap = project.deliberationMap
    ? project.deliberationMap.replace(/.*markdown[\s\S]*?/, "").trim()
    : project.deliberationMap;


  return (
    <div className="mt-12 space-y-8 relative mb-4">
      <div>
        <h2 className="text-2xl font-bold">Deliberation Map</h2>
        <div className="mt-4 bg-muted rounded-lg p-4 relative">
          <div className="prose">
            {cleanedDeliberationMap ? (
              <ReactMarkdown>{cleanedDeliberationMap}</ReactMarkdown>
            ) : (
              <p className="text-gray-500">After the first comment, AI will create a deliberation map.</p>
            )}
          </div>
          <div className="absolute -bottom-24 -left-4 md:-bottom-16 md:-left-16 mb-4 ml-4 z-100 flex items-center">
            <div className="w-[100px] h-[100px] relative">
              <Image src="/200w.gif" alt="Animated GIF" layout="fill" className="object-cover rounded-full" />
            </div>
            <p className="-ml-1 pl-4 text-background p-2 bg-accent/90 rounded-lg">As a mighty AI I summarize thoughts about this project</p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                document.getElementById('add-comment-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Add my thoughts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};



const CommentsScore: React.FC<{ comments: any[] }> = ({ comments }) => (
  <div className='pt-16 md:pt-8'>
    <h2 className="text-2xl font-bold">Comments Score</h2>
    <div className="mt-4">
      <AreaChart
        width={500}
        height={250}
        data={comments.map((comment) => ({
          name: comment.wallet.slice(0, 6),
          rating: comment.rating,
        }))}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <Tooltip />
        <Area type="monotone" dataKey="rating" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>
    </div>
  </div>
);

const CommentsSection: React.FC<any> = ({ comments, renderRatingIcon, handlePowerUp }) => (
  <div>
    <h2 className="text-2xl font-bold">Comments</h2>
    <div className="mt-4 space-y-6">
      {comments.map((comment: any) => (
        <div
          key={comment.id}
          className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg ${comment.premium ? 'border border-accent' : ''}`}
        >
          <Avatar className="w-10 h-10 border">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="font-medium truncate sm:max-w-xs">{comment.wallet}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 sm:mt-0">
                <Image src="/coin.gif" alt="Coin" width={24} height={24} />
                <span>Authority: {Math.floor(comment.weight)}</span>
                {comment.rating && (
                  <div className="flex items-center gap-1">
                    {renderRatingIcon(comment.rating)}
                    <span>Rating: {comment.rating || "N/A"}</span>
                  </div>
                )}
              </div>
            </div>
            {comment.premium && (
              <div className="bg-accent text-white px-2 py-1 rounded-full inline-block text-xs">
                Boosted
              </div>
            )}
            <div className="prose">
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePowerUp(comment.id)}>
                <PlusIcon className="w-4 h-4" />
                Boost
              </Button>
              <Button variant="outline" size="sm">
                <EditIcon className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CommentForm: React.FC<any> = ({
  content, 
  setContent, 
  rating, 
  setRating, 
  boostAmount, 
  incrementAmount, 
  decrementAmount, 
  balance, 
  addComment, 
  errorMessage, 
  successMessage, 
  isLoading, 
  isFirstComment
}) => (
  <div id="add-comment-section">
    <h2 className="text-2xl font-bold pt-4">Add a Comment</h2>
    <form className="mt-4 space-y-4" onSubmit={addComment}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment here..."
        className="w-full"
        rows={4}
      />
      <div>
        <h2 className="text-2xl font-bold">Rate This Project</h2>
        <RatingSlider value={rating} onChange={setRating} />
        <div>Your rating: {rating}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={decrementAmount}
            disabled={isLoading || boostAmount <= 1 || isFirstComment}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <div className="text-2xl font-bold flex items-center gap-2">
            <Image src="/coin.gif" alt="Coin" width={24} height={24} />
            {isFirstComment ? 'Free' : parseFloat(boostAmount).toFixed(1)}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={incrementAmount}
            disabled={isLoading || boostAmount >= balance || isFirstComment}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
        <div className="flex items-start space-x-2 pb-4">
          <span className="text-foreground font-semibold">Available:</span>
          <Image src="/coin.gif" alt="Coin" width={24} height={24} />
          <span className="text-foreground font-semibold">{(balance) ? parseFloat(balance).toFixed(1) : '...'}</span>
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding Comment...' : 'Post Comment'}
      </Button>
    </form>
    {errorMessage && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{errorMessage}</span>
      </div>
    )}
    {successMessage && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{successMessage}</span>
      </div>
    )}
  </div>
);

export default Project;
