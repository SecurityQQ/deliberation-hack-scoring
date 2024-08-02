import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export const generateDeliberationMap = async (projectId: number) => {
  // Get project and its comments
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { comments: true },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Combine project description and comments with their weights and ratings
  const combinedContent = `
    Project Description: ${project.description}
    Comments:
    ${project.comments.map(comment => `- ${comment.content} (Weight: ${comment.weight}, Rating (0-100): ${comment?.rating ?? 'N/A'})`).join('\n')}
  `;

  // Call OpenAI API to create deliberation map
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: "user",
      content: `
        Create a 450-character length deliberation map for the following content. Use markdown, emojis, and try to be structured. Your goal is to return a deliberation map that will be used for hackathon project selection. Use some criteria like: Technical Completeness, Future Plans, Creativity, and Overall Impression. Please pay attention that inside the content there are comments with different weights and ratings; the more weight and higher rating, the more important the comment is:

        ${combinedContent}
      `
    }],
    max_tokens: 500,
  });

  if (!response.choices || !response.choices[0].message?.content) {
    throw new Error('Failed to generate deliberation map');
  }

  const deliberationMap = response.choices[0].message.content.trim();

  // Update project with the new deliberation map
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { deliberationMap },
  });

  return updatedProject;
};
