// pages/index.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { prisma } from '../lib/prisma';
import Layout from "@/components/Layout";

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
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Hackathon Projects</h1>
        <div className="flex flex-wrap gap-4">
          {projects.map((project) => (
            <div key={project.id} className="flex-1 border p-4 rounded-lg max-w-sm">
              <Link href={`/projects/${project.id}`}>
                  <img src={project.image} alt={project.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <h2 className="text-xl font-bold">{project.title}</h2>
              </Link>
              <p className="mb-4">{project.description}</p>
              <p className="mb-4 truncate"><strong>Owner:</strong> {project.owner}</p>
              <h3 className="font-semibold">Comments:</h3>
              <ul>
                {project.comments.map((comment) => (
                  <li key={comment.id} className="border-t mt-2 pt-2">{comment.content}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
