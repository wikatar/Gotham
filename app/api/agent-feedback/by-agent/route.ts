import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/agent-feedback/by-agent?agentId=X
 * Retrieves aggregated feedback statistics for a specific agent
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    
    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: agentId' },
        { status: 400 }
      );
    }
    
    // Find all execution logs for this agent
    const executionLogs = await prisma.agentExecutionLog.findMany({
      where: {
        agentId: agentId
      },
      select: {
        id: true,
        feedback: true
      }
    });
    
    // Extract feedback from all execution logs
    const allFeedback = executionLogs.flatMap(log => log.feedback);
    
    // If no feedback found
    if (allFeedback.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          count: 0,
          averageRating: null,
          actionEffectivenessRate: null,
          latestComments: [],
          feedbackOverTime: []
        }
      });
    }
    
    // Calculate statistics
    const totalRating = allFeedback.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalRating / allFeedback.length;
    
    // Calculate action effectiveness (only from entries that have this field set)
    const effectivenessFeedbacks = allFeedback.filter(feedback => feedback.wasActionEffective !== null);
    let actionEffectivenessRate = null;
    
    if (effectivenessFeedbacks.length > 0) {
      const effectiveCount = effectivenessFeedbacks.filter(feedback => feedback.wasActionEffective === true).length;
      actionEffectivenessRate = effectiveCount / effectivenessFeedbacks.length;
    }
    
    // Get latest comments (up to 5)
    const latestComments = allFeedback
      .filter(feedback => feedback.comment && feedback.comment.trim() !== '')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(feedback => ({
        id: feedback.id,
        comment: feedback.comment,
        rating: feedback.rating,
        createdAt: feedback.createdAt
      }));
    
    // Organize feedback by day for time-series
    const feedbackByDay = new Map();
    
    allFeedback.forEach(feedback => {
      const date = new Date(feedback.createdAt).toISOString().split('T')[0];
      
      if (!feedbackByDay.has(date)) {
        feedbackByDay.set(date, {
          date,
          ratings: [],
          count: 0
        });
      }
      
      feedbackByDay.get(date).ratings.push(feedback.rating);
      feedbackByDay.get(date).count += 1;
    });
    
    // Calculate average rating per day
    const feedbackOverTime = Array.from(feedbackByDay.values())
      .map(day => ({
        date: day.date,
        averageRating: day.ratings.reduce((sum, rating) => sum + rating, 0) / day.count,
        count: day.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Return the aggregated statistics
    return NextResponse.json({
      success: true,
      data: {
        count: allFeedback.length,
        averageRating,
        actionEffectivenessRate,
        latestComments,
        feedbackOverTime
      }
    });
  } catch (error) {
    console.error('Error fetching aggregated feedback for agent:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 