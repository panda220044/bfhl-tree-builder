import { NextResponse } from 'next/server';
import { parseEdges } from '@/lib/parser';
import { buildHierarchies } from '@/lib/graph';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: 'Invalid input. Expected JSON object with a "data" array of strings.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { data } = body;
    const { validEdges, invalidEntries, duplicateEdges } = parseEdges(data);
    const { hierarchies, summary } = buildHierarchies(validEdges);

    const response = {
      user_id: "eashita_16112004", 
      email_id: "eashita3962.beai23@chitkara.edu.in",
      college_roll_number: "2310993962",
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary
    };

    return NextResponse.json(response, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while processing the request.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
