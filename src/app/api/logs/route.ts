import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filter = searchParams.get('filter') || 'all'; // 'all', 'ffn', 'shopify'
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

  try {
    let query = supabase
      .from('api_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filter === 'ffn') {
      query = query.ilike('path', '%/api/ffn%');
    } else if (filter === 'shopify') {
      query = query.ilike('path', '%/callback%').not('path', 'ilike', '%/api/ffn%');
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching logs from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [], count: count || (data ? data.length : 0) });
  } catch (err: any) {
    console.error('Logs API GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const singleId = searchParams.get('id');

  try {
    // 1. Single delete via query parameter ?id=...
    if (singleId) {
      const { error } = await supabase.from('api_logs').delete().eq('id', singleId);
      if (error) {
        console.error('Error deleting log by id:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, deleted: 1 });
    }

    // 2. Batch delete via JSON body { ids: [...] } or { clearFilter: 'ffn' | 'shopify' }
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      const { error } = await supabase.from('api_logs').delete().in('id', body.ids);
      if (error) {
        console.error('Error batch deleting logs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, deleted: body.ids.length });
    }

    if (body.clearFilter) {
      let delQuery = supabase.from('api_logs').delete();
      if (body.clearFilter === 'ffn') {
        delQuery = delQuery.ilike('path', '%/api/ffn%');
      } else if (body.clearFilter === 'shopify') {
        delQuery = delQuery.ilike('path', '%/callback%').not('path', 'ilike', '%/api/ffn%');
      } else if (body.clearFilter === 'all') {
        delQuery = delQuery.neq('id', 0); // Delete all rows where id exists
      } else {
        return NextResponse.json({ error: 'Invalid clearFilter value' }, { status: 400 });
      }

      const { error } = await delQuery;
      if (error) {
        console.error('Error clearing logs by filter:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: `Cleared ${body.clearFilter} logs` });
    }

    return NextResponse.json({ error: 'No id, ids array, or clearFilter provided' }, { status: 400 });
  } catch (err: any) {
    console.error('Logs API DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
