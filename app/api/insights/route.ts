import { NextResponse } from 'next/server'
import connectToDatabase from '../../lib/db'
import models from '../../models/schema'

// Sample insights (since we don't have a real database connection yet)
const sampleInsights = [
  {
    id: '1',
    title: 'Revenue Optimization',
    content: 'Based on historical transaction data, we predict a 12% revenue increase if you adjust pricing by 5% in the Electronics category during weekend promotions.',
    confidence: 87,
    tags: ['Revenue', 'Pricing', 'Prediction'],
    generated_at: new Date().toISOString(),
    status: 'approved',
  },
  {
    id: '2',
    title: 'Inventory Pattern',
    content: 'We\'ve detected a recurring seasonal pattern in your inventory levels. Consider increasing stock of outdoor equipment by 20% before May to avoid stockouts.',
    confidence: 92,
    tags: ['Inventory', 'Seasonal', 'StockLevel'],
    generated_at: new Date().toISOString(),
    status: 'approved',
  },
  {
    id: '3',
    title: 'Customer Segmentation',
    content: 'Your customer base can be optimally segmented into 5 groups based on purchasing behavior. The "High-value Early Adopters" segment has grown 14% this quarter.',
    confidence: 79,
    tags: ['Customers', 'Segmentation', 'Growth'],
    generated_at: new Date().toISOString(),
    status: 'approved',
  },
]

export async function GET() {
  try {
    // When connected to a real database, this would use the models
    // await connectToDatabase()
    // const insights = await models.Insight.find({ status: 'approved' }).sort({ generated_at: -1 }).limit(10)
    
    // Return sample data for now
    return NextResponse.json({ insights: sampleInsights })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, confidence, tags } = body
    
    // Validate input
    if (!title || !content || !confidence) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // When connected to a real database, this would create a new insight
    // await connectToDatabase()
    // const insight = await models.Insight.create({
    //   title,
    //   content,
    //   confidence,
    //   tags: tags || [],
    //   status: 'pending',
    // })
    
    // For now, just return the input as a new sample insight
    const newInsight = {
      id: (sampleInsights.length + 1).toString(),
      title,
      content,
      confidence,
      tags: tags || [],
      generated_at: new Date().toISOString(),
      status: 'pending',
    }
    
    return NextResponse.json({ insight: newInsight })
  } catch (error) {
    console.error('Error creating insight:', error)
    return NextResponse.json(
      { error: 'Failed to create insight' },
      { status: 500 }
    )
  }
} 