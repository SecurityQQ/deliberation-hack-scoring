import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PrismaClient } from "@prisma/client";
import Layout from "@/components/Layout";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const prisma = new PrismaClient();

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  weight: number;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  owner: string;
  deliberationMap?: string;
  aiSummary?: string;
  rank: number;
  totalWeight: number;
  comments: Comment[];
}

interface LeaderboardProps {
  projects: Project[];
}

export async function getServerSideProps() {
  const projects = await prisma.project.findMany({
    include: { comments: true },
  });

  const rankedProjects = projects
    .map((project) => {
      const totalWeight = project.comments.reduce(
        (sum, comment) => sum + comment.weight,
        0
      );

      return {
        ...project,
        totalWeight: totalWeight,
        rank: project?.rank || -1,
        comments: project.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
        })),
      };
    })
    .sort((a, b) => a.rank - b.rank); // Ensure projects are sorted by rank in ascending order

  return {
    props: { projects: rankedProjects },
  };
}

const Leaderboard: React.FC<LeaderboardProps> = ({ projects: initialProjects }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (7 - targetDate.getDay() + 1) % 7);
    targetDate.setHours(18, 0, 0, 0);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      const hours = String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0");
      const minutes = String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0");
      const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, "0");

      setTimeLeft(`${hours}:${minutes}:${seconds}`);

      if (difference <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePredictClick = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/predict", { method: "POST" });
      const data = await response.json();
      if (data.error) {
        console.error("Error generating predictions:", data.error);
      } else {
        // Fetch updated projects from the server
        const updatedResponse = await fetch("/api/projects");
        const updatedProjects: Project[] = await updatedResponse.json();
        setProjects(updatedProjects.sort((a, b) => a.rank - b.rank)); // Ensure projects are sorted by rank
      }
    } catch (error) {
      console.error("Error generating predictions:", error);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="bg-background text-foreground w-full max-w-6xl mx-auto py-12 px-4 md:px-6 pt-0 mt-0">
        <div className="flex flex-col items-center space-y-8 ">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">Leaderboard</h2>
            <p className="text-muted-foreground">Ranked 100% by AI</p>
            <div className="relative px-4 py-0 rounded-md flex items-center">
              <div className="w-[100px] h-[100px] relative">
                <Image src="/200w.gif" alt="Animated GIF" layout="fill" className="object-cover rounded-full" />
              </div>
              <Button
                className="-ml-4 pl-4 text-background p-2 bg-accent/90 rounded-lg ml-4"
                onClick={handlePredictClick}
                disabled={loading}
              >
                {loading ? "Making My Prediction..." : "Only I know Who is Our Next Winner"}
              </Button>
            </div>
            <div className="bg-muted px-4 py-2 rounded-md text-lg font-medium text-muted-foreground">
              Winner will be selected in: {timeLeft}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <AnimatePresence>
              {projects.map((project, index) => {
                const cleanedDeliberationMap = project.deliberationMap
                  ? project.deliberationMap.replace(/.*markdown[\s\S]*?/, "").trim()
                  : project.deliberationMap;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card text-card-foreground p-6 rounded-lg shadow-lg">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold">{project.title}</h3>
                          <div className="bg-muted px-2 py-1 rounded-md text-xs font-medium text-muted-foreground">
                            #{project.rank}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <img src={project.image} alt={`${project.title} image`} className="rounded-md" />
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold">AI Summary</h4>
                            <p className="text-sm text-muted-foreground">{project.aiSummary}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold">Deliberation Map</h4>
                            <div className="max-h-48 overflow-y-auto">
                              <ReactMarkdown className="text-sm text-muted-foreground">
                                {cleanedDeliberationMap || "No deliberation map available."}
                              </ReactMarkdown>
                            </div>
                            <Link href={`/projects/${project.id}`} className="mt-2 text-primary" prefetch={false}>
                              Read more
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Link href={`/projects/${project.id}`} passHref>
                            <Button variant="outline">Discuss Project</Button>
                          </Link>
                          <div className="bg-muted px-2 py-1 rounded-md text-xs font-medium text-muted-foreground">
                            Discussion worth: ${project.totalWeight.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Leaderboard;
