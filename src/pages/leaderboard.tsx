import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PrismaClient } from "@prisma/client";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

const prisma = new PrismaClient();

export async function getServerSideProps() {
  const projects = await prisma.project.findMany({
    include: {
      comments: true,
    },
  });

  // Convert Date objects to strings for serialization
  const rankedProjects = projects
    .map(project => {
      const totalComments = project.comments.length;
      const totalWeight = project.comments.reduce((sum, comment) => sum + comment.weight, 0);

      return {
        ...project,
        rank: totalWeight,
        comments: project.comments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(), // Convert Date to string
        })),
      };
    })
    .sort((a, b) => b.rank - a.rank);

  return {
    props: {
      projects: rankedProjects,
    },
  };
}

export default function Leaderboard({ projects }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (7 - targetDate.getDay() + 1) % 7);
    targetDate.setHours(18, 0, 0, 0);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      const hours = String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, '0');

      setTimeLeft(`${hours}:${minutes}:${seconds}`);

      if (difference <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
            <Button className="-ml-4 pl-4 text-background p-2 bg-accent/90 rounded-lg ml-4">Only I know Who is Our Next Winner</Button>
          </div>
          <div className="bg-muted px-4 py-2 rounded-md text-lg font-medium text-muted-foreground">
            Winner will be selected in: {timeLeft}
          </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {projects.map((project, index) => {
              const cleanedDeliberationMap = project.deliberationMap
                ? project.deliberationMap.replace(/.*markdown[\s\S]*?/, "").trim()
                : project.deliberationMap;

              return (
                <Card key={project.id} className="bg-card text-card-foreground p-6 rounded-lg shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{project.title}</h3>
                      <div className="bg-muted px-2 py-1 rounded-md text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <img src={project.image} alt={`${project.title} image`} className="rounded-md" />
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold">AI Summary</h4>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
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
                        Discussion worth: ${project.rank.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
