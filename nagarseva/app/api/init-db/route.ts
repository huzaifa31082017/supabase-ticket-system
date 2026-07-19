import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

/**
 * POST /api/init-db
 * Initialize database schema if it doesn't exist
 */
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    console.log('🔧 Initializing database schema...')

    // Check if wards table exists
    const { data: wardsCheck, error: wardsCheckError } = await supabase
      .from('wards')
      .select('id')
      .limit(1)

    if (wardsCheckError && wardsCheckError.code === 'PGRST116') {
      // Table doesn't exist - we need the user to run the schema
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database tables not initialized',
          instructions:
            'Please run the SUPABASE_SCHEMA.sql file in your Supabase SQL Editor. Go to Supabase Dashboard > SQL Editor > New Query > Paste the schema SQL > Run.',
        },
        { status: 503 }
      )
    }

    if (wardsCheckError) {
      throw wardsCheckError
    }

    // Check if we have sample data
    if (!wardsCheck || wardsCheck.length === 0) {
      console.log('📊 Inserting sample data...')

      // Insert sample wards
      const { data: insertedWards, error: wardInsertError } = await supabase
        .from('wards')
        .insert([
          { name: 'Downtown Ward', total_population: 45000, responsiveness_score: 92, escalated_count: 0 },
          { name: 'North Central Ward', total_population: 52000, responsiveness_score: 85, escalated_count: 2 },
          { name: 'South City Ward', total_population: 38000, responsiveness_score: 78, escalated_count: 3 },
          { name: 'East Point Ward', total_population: 41000, responsiveness_score: 65, escalated_count: 5 },
          { name: 'West End Ward', total_population: 39000, responsiveness_score: 45, escalated_count: 8 },
        ])
        .select()

      if (wardInsertError) {
        console.error('Error inserting wards:', wardInsertError)
        throw wardInsertError
      }

      // Get ward IDs for ticket insertion
      const { data: allWards, error: wardsError } = await supabase.from('wards').select('id, name')

      if (wardsError) throw wardsError

      const wardMap = Object.fromEntries(allWards?.map((w: any) => [w.name, w.id]) || [])

      // Insert sample tickets
      const { error: ticketInsertError } = await supabase.from('tickets').insert([
        {
          title: 'Pothole repair on Main Street',
          description: 'Large pothole creating traffic hazard',
          category: 'Infrastructure',
          status: 'Open',
          sla_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          ward_id: wardMap['Downtown Ward'],
          is_escalated: false,
        },
        {
          title: 'Water supply interruption',
          description: 'Residents reporting no water supply in sector 5',
          category: 'Water Supply',
          status: 'In Progress',
          sla_deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          ward_id: wardMap['North Central Ward'],
          is_escalated: false,
        },
        {
          title: 'Street light malfunction',
          description: 'Multiple street lights not working on 5th Avenue',
          category: 'Public Safety',
          status: 'Open',
          sla_deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          ward_id: wardMap['East Point Ward'],
          is_escalated: true,
        },
        {
          title: 'Garbage collection delay',
          description: 'Waste not collected for 3 days',
          category: 'Sanitation',
          status: 'In Progress',
          sla_deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          ward_id: wardMap['South City Ward'],
          is_escalated: false,
        },
        {
          title: 'Park maintenance issue',
          description: 'Broken playground equipment',
          category: 'Parks & Recreation',
          status: 'Open',
          sla_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          ward_id: wardMap['West End Ward'],
          is_escalated: false,
        },
      ])

      if (ticketInsertError) {
        console.error('Error inserting tickets:', ticketInsertError)
        throw ticketInsertError
      }

      console.log('✅ Sample data inserted successfully')
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Database initialized successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Database initialization error:', error)

    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Database initialization failed',
        error: errorMsg,
        details: 'Check Supabase dashboard to ensure tables exist and RLS policies allow access',
      },
      { status: 500 }
    )
  }
}
