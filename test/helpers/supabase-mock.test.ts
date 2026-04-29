import { describe, it, expect, beforeEach } from 'vitest';
import { createSupabaseMock } from './supabase-mock';

describe('createSupabaseMock', () => {
  let mock: ReturnType<typeof createSupabaseMock>;

  beforeEach(() => {
    mock = createSupabaseMock();
  });

  it('returns configured response for maybeSingle', async () => {
    mock.setResponse('invites', { data: { id: 'inv-1', guest_name: 'Ada' } });
    const res = await mock.client
      .from('invites')
      .select('*')
      .eq('token', 't')
      .maybeSingle();
    expect(res).toEqual({ data: { id: 'inv-1', guest_name: 'Ada' } });
  });

  it('returns configured response for single after insert', async () => {
    mock.setResponse('questions', { data: { id: 'q-1' } });
    const res = await mock.client
      .from('questions')
      .insert({ question_text: 'Hi' })
      .select()
      .single();
    expect(res).toEqual({ data: { id: 'q-1' } });
  });

  it('is thenable for list queries', async () => {
    mock.setResponse('events', { data: [{ id: 'e1' }, { id: 'e2' }] });
    const res = await mock.client.from('events').select('*').order('sort_order');
    expect(res.data).toHaveLength(2);
  });

  it('defaults to empty data when no response configured', async () => {
    const res = await mock.client.from('photos').select('*');
    expect(res).toEqual({ data: null, error: null });
  });

  it('records call order', async () => {
    mock.setResponse('invites', { data: null });
    await mock.client.from('invites').select('*').eq('token', 't').maybeSingle();
    const names = mock.calls.map((c) => c.method);
    expect(names).toEqual(['from', 'select', 'eq', 'maybeSingle']);
  });

  it('reset clears responses and calls', async () => {
    mock.setResponse('invites', { data: { id: 'x' } });
    await mock.client.from('invites').select('*').maybeSingle();
    mock.reset();
    expect(mock.calls).toEqual([]);
    const res = await mock.client.from('invites').select('*').maybeSingle();
    expect(res.data).toBeNull();
  });

  it('supports update/delete chains', async () => {
    mock.setResponse('invites', { data: null });
    await mock.client.from('invites').update({ status: 'responded' }).eq('id', '1');
    await mock.client.from('rsvps').delete().eq('invite_id', '1');
    const methods = mock.calls.map((c) => c.method);
    expect(methods).toContain('update');
    expect(methods).toContain('delete');
  });

  it('returns errors when configured', async () => {
    mock.setResponse('invites', { data: null, error: new Error('boom') });
    const res = await mock.client.from('invites').select('*').maybeSingle();
    expect(res.error).toBeInstanceOf(Error);
  });

  it('queueResponse pops one response per terminal call then falls back to sticky', async () => {
    mock.queueResponse('invites', { data: [{ id: 'a' }] });
    mock.queueResponse('invites', { data: { id: 'b' } });
    mock.setResponse('invites', { data: 'sticky' });

    const list = await mock.client.from('invites').select('*');
    expect(list.data).toEqual([{ id: 'a' }]);

    const single = await mock.client.from('invites').insert({}).select().single();
    expect(single.data).toEqual({ id: 'b' });

    const after = await mock.client.from('invites').select('*').maybeSingle();
    expect(after.data).toBe('sticky');
  });
});
