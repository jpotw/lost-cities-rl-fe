import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received game state for AI move:', body);
    // Return a dummy AI move: [cardIndex, playOrDiscard, drawSource]
    const aiAction: [number, number, number] = [0, 0, 0];
    return NextResponse.json({ action: aiAction });
  } catch (error) {
    console.error('Error in AI move endpoint:', error);
    return NextResponse.json({ detail: 'Error processing request' }, { status: 400 });
  }
} 