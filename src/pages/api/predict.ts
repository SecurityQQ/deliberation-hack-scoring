import { PrismaClient } from "@prisma/client";
import OpenAI from 'openai';
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export const config = {
  maxDuration: 30,  // vercel config for 30sec timeout
};

export const generateSummariesAndRanks = async () => {
  // Get all projects and their deliberation maps
  const projects = await prisma.project.findMany({
    include: { comments: true },
  });

  // Combine deliberation maps
  const combinedContent = projects.map(project => `
    Project ID: ${project.id}
    Project Title: ${project.title}
    Project Description: ${project.description}
    Deliberation Map: ${project.deliberationMap}
    Comments:
    ${project.comments.map(comment => `- ${comment.content} (Weight: ${comment.weight}, Rating: ${comment?.rating ?? 'N/A'})`).join('\n')}
  `).join('\n\n');

  // Call OpenAI API to create summaries and ranks
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `
        Please provide only a valid JSON array with each object containing a "projectId", "summary", and "rank" for each project based on the following deliberation maps and comments:
        ${combinedContent}

        Use some criteria like: Technical Completeness, Future Plans, Creativity, and Overall Impression. Please pay attention that inside the content there are comments with different weights and ratings; the more weight and higher rating, the more important the comment is.
        Ranks should be from 1 to N, 1 is the best project.
        The format should be as follows:
        [
          {
            "projectId": "Project ID",
            "summary": "Main advantages of ... makes this project better than ... that is why it is ranked higher ...",
            "rank": "Rank position"
          },
          {
            "projectId": "Project ID",
            "summary": "Brief summary of the project.",
            "rank": "Rank position"
          }
        ]
      `
    }],
    max_tokens: 2000,
  });

  if (!response.choices || !response.choices[0].message?.content) {
    console.error("Failed to generate deliberation map from OpenAI");
    return { error: 'Failed to generate deliberation map' };
  }

  const jsonResponse = response.choices[0].message.content.trim();

  console.log("GPT returned: ", jsonResponse);

  let summariesAndRanks;
  try {
    summariesAndRanks = JSON.parse(jsonResponse);
  } catch (error) {
    console.error('Failed to parse OpenAI response', error);
    return { error: 'Failed to parse OpenAI response' };
  }

  // Update each project with the new AI Summary and rank
  for (const { projectId, summary, rank } of summariesAndRanks) {
    await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: {
        aiSummary: summary.trim(),
        rank: parseFloat(rank),
      },
    });
  }

  return { success: true };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const result = await generateSummariesAndRanks();
      if (result.error) {
        res.status(500).json({ error: result.error });
      } else {
        res.status(200).json({ message: "Predictions generated successfully" });
      }
    } catch (error) {
      console.error("Error generating predictions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
