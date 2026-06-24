import { NextResponse } from 'next/server';
import { parseEdges } from '@/lib/parser';
import { buildHierarchies } from '@/lib/graph';

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate body structure
    if (!body || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: 'Invalid input. Expected JSON object with a "data" array of strings.' },
        { status: 400 }
      );
    }

    const { data } = body;

    // Parse and validate edges
    const { validEdges, invalidEntries, duplicateEdges } = parseEdges(data);

    // Build hierarchies and summary
    const { hierarchies, summary } = buildHierarchies(validEdges);

    // Prepare response
    // NOTE: You can customize these details as per your personal details
    const response = {
      user_id: "eashita_24062026", 
      email_id: "eashita@college.edu",
      college_roll_number: "26BCE1001",
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
