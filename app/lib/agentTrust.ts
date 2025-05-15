import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Updates an agent's trust score based on feedback
 * The trust score is a number between 0 and 1, calculated from:
 * - Average rating (scaled from 1-5 to 0-1)
 * - Action effectiveness rate (already 0-1)
 * - Feedback count (more feedback increases confidence in the score)
 */
export async function updateAgentTrust(agentId: string): Promise<number> {
  try {
    // Get all execution logs for this agent
    const executionLogs = await prisma.agentExecutionLog.findMany({
      where: {
        agentId: agentId
      },
      select: {
        id: true,
        feedback: true
      }
    });
    
    // Extract all feedback
    const allFeedback = executionLogs.flatMap(log => log.feedback);
    
    // If no feedback, set trust score to 0.5 (neutral)
    if (allFeedback.length === 0) {
      // Update the agent model with neutral score
      await prisma.agent.update({
        where: { id: agentId },
        data: { trustScore: 0.5 }
      });
      return 0.5;
    }
    
    // Calculate average rating (scale from 1-5 to 0-1)
    const totalRating = allFeedback.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalRating / allFeedback.length;
    const ratingScore = (averageRating - 1) / 4; // Convert from 1-5 to 0-1
    
    // Calculate effectiveness score
    const effectivenessFeedbacks = allFeedback.filter(feedback => feedback.wasActionEffective !== null);
    let effectivenessScore = 0.5; // Default if no effectiveness data
    
    if (effectivenessFeedbacks.length > 0) {
      const effectiveCount = effectivenessFeedbacks.filter(feedback => feedback.wasActionEffective === true).length;
      effectivenessScore = effectiveCount / effectivenessFeedbacks.length;
    }
    
    // Confidence multiplier based on feedback count (caps at 20 feedbacks)
    const confidenceMultiplier = Math.min(allFeedback.length / 20, 1);
    
    // Calculate base score from rating and effectiveness (weighted)
    const baseScore = (ratingScore * 0.7) + (effectivenessScore * 0.3);
    
    // Apply confidence (shifts from 0.5 neutral toward the earned score)
    const trustScore = 0.5 + ((baseScore - 0.5) * confidenceMultiplier);
    
    // Update the agent model with the trust score
    await prisma.agent.update({
      where: { id: agentId },
      data: { trustScore }
    });
    
    return trustScore;
  } catch (error) {
    console.error('Error updating agent trust score:', error);
    return 0.5; // Default neutral score on error
  }
} 