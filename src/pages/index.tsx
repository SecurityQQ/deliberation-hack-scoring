// pages/index.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { prisma } from '../lib/prisma';
import Layout from "@/components/Layout";
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';


// Define types for Project and Comment
interface Comment {
  id: number;
  content: string;
  createdAt: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  owner: string;
  comments: Comment[];
}

interface HomeProps {
  projects: Project[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  const projects = await prisma.project.findMany({
    include: { comments: true },
  });

  // Convert Date objects to strings
  const serializedProjects = projects.map((project) => ({
    ...project,
    comments: project.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  }));

  return { props: { projects: serializedProjects } };
};

const Home: React.FC<HomeProps> = ({ projects }) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleReadMore = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Hackathon Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="border p-4 rounded-lg shadow-lg"
            >
              <Link href={`/projects/${project.id}`}>
                  <Image 
                    src={project.image} 
                    alt={project.title} 
                    width={400} 
                    height={200} 
                    className="w-full h-48 object-cover rounded-lg mb-4" 
                  />
                  <h2 className="text-xl font-bold">{project.title}</h2>
              </Link>
              <div className={`mb-4 ${expanded[project.id] ? '' : 'max-h-20 overflow-hidden'}`}>
                <ReactMarkdown>{project.description}</ReactMarkdown>
              </div>
              <button
                className="text-primary hover:underline"
                onClick={() => toggleReadMore(project.id)}
              >
                {expanded[project.id] ? 'Read less' : 'Read more'}
              </button>
              <p className="mt-4"><strong>Owner:</strong> {project.owner}</p>
              <h3 className="font-semibold mt-4">Comments:</h3>
              <ul className="mt-2">
                {project.comments.slice(0, 3).map((comment) => (
                  <li key={comment.id} className="border-t mt-2 pt-2 text-ellipsis overflow-hidden">{comment.content}</li>
                ))}
              </ul>
              {project.comments.length > 3 && (
                <p className="text-primary hover:underline mt-2">
                  +{project.comments.length - 3} more comments
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
