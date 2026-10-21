'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type RoomRecord = {
  id: string;
  club_id: string;
  room_type: 'general' | 'members' | 'core';
  name: string;
  created_at: string;
};

type ClubRecord = {
  id: string;
  name: string;
  approval_status: string;
};

type RoomMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  profiles?: { display_name: string; avatar_url: string | null } | null;
};

const roomDescriptions: Record<RoomRecord['room_type'], string> = {
  general: 'All confirmed IIT Bhilai email accounts can read and write here for an approved club.',
  members: 'Active members, Core Members, and the Coordinator can access this room.',
  core: 'Restricted to active Core Members and the Coordinator.',
};

function timeLabel(value: string): string {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ClubRoomsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedClubId = searchParams.get('club');
  const [userId, setUserId] = useState('');
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [clubs, setClubs] = useState<ClubRecord[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [activeRoomId, setActiveRoomId] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/messages');
        return;
      }
      setUserId(authData.user.id);
      if (!authData.user.email_confirmed_at || !/^[^@\s]+@iitbhilai\.ac\.in$/i.test(authData.user.email ?? '')) {
        throw new Error('A confirmed @iitbhilai.ac.in email is required to use club rooms.');
      }

      const [{ data: roomData, error: roomError }, { data: clubData, error: clubError }] = await Promise.all([
        supabase.from('club_rooms').select('id, club_id, room_type, name, created_at').order('created_at'),
        supabase.from('clubs').select('id, name, approval_status').order('name'),
      ]);
      if (roomError) throw roomError;
      if (clubError) throw clubError;

      const loadedRooms = (roomData ?? []) as RoomRecord[];
      setRooms(loadedRooms);
      setClubs((clubData ?? []) as ClubRecord[]);

      const preferRequested = loadedRooms.find((room) => room.club_id === requestedClubId && room.room_type === 'general');
      setActiveRoomId((current) => current && loadedRooms.some((room) => room.id === current)
        ? current
        : preferRequested?.id ?? loadedRooms[0]?.id ?? '');
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load your room list.'));
    } finally {
      setLoading(false);
    }
  }, [router, requestedClubId]);

  const loadMessages = useCallback(async (roomId: string) => {
    if (!roomId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    setError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
      const { data, error: messagesError } = await supabase
        .from('club_room_messages')
        .select('id, room_id, sender_id, content, created_at, edited_at, profiles:profiles!club_room_messages_sender_id_fkey(display_name, avatar_url)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(150);
      if (messagesError) throw messagesError;
      setMessages((data ?? []) as unknown as RoomMessage[]);
    } catch (loadError) {
      setMessages([]);
      setError(supabaseErrorMessage(loadError, 'Unable to load messages for this room.'));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads the authenticated user's allowed rooms from Supabase.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads the authenticated user's allowed rooms from Supabase.
  useEffect(() => { void loadRooms(); }, [loadRooms]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Load messages whenever the selected room changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Load messages whenever the selected room changes.
  useEffect(() => { void loadMessages(activeRoomId); }, [activeRoomId, loadMessages]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Subscribe to database changes for the selected room; cleanup removes the channel.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Subscribe to database changes for the selected room; cleanup removes the channel.
  useEffect(() => {
    if (!activeRoomId) return;
    const channel = supabase
      .channel(`club-room-${activeRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'club_room_messages',
        filter: `room_id=eq.${activeRoomId}`,
      }, () => { void loadMessages(activeRoomId); })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [activeRoomId, loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? null;
  const activeClub = activeRoom ? clubs.find((club) => club.id === activeRoom.club_id) : null;
  const accessibleRooms = useMemo(() => rooms.filter((room) => {
    const club = clubs.find((item) => item.id === room.club_id);
    return !!club && club.approval_status === 'approved';
  }), [rooms, clubs]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRoom || !draft.trim()) return;
    setSending(true);
    setError('');
    setNotice('');
    try {
      const { error: sendError } = await supabase.from('club_room_messages').insert({
        room_id: activeRoom.id,
        sender_id: userId,
        content: draft.trim(),
      });
      if (sendError) throw sendError;
      setDraft('');
      await loadMessages(activeRoom.id);
    } catch (sendError) {
      setError(supabaseErrorMessage(sendError, 'Unable to send the message. You may not have access to this room.'));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading your available rooms…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Secure club spaces</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Club Rooms</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Rooms and messages are stored in Supabase. Database row-level policies—not hidden buttons—decide who can read and send messages.</p>
      </div>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span className="break-words">{error}</span></div>}
      {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{notice}</div>}

      <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-4 py-4">
            <h2 className="font-bold text-slate-900">Available rooms</h2>
            <p className="mt-1 text-xs text-slate-500">Rooms you can access are listed here by database policy.</p>
          </div>
          <div className="max-h-[300px] space-y-1 overflow-y-auto p-2 lg:max-h-[600px]">
            {accessibleRooms.length === 0 && (
              <div className="p-4 text-sm leading-6 text-slate-500">No approved club rooms are visible to your account yet. Join an approved club, accept an invitation, or wait for a club proposal to be approved.</div>
            )}
            {accessibleRooms.map((room) => {
              const club = clubs.find((item) => item.id === room.club_id);
              const active = room.id === activeRoomId;
              const Glyph = room.room_type === 'general' ? Users : room.room_type === 'members' ? ShieldCheck : LockKeyhole;
              return <button key={room.id} onClick={() => setActiveRoomId(room.id)} className={`flex w-full gap-3 rounded-xl p-3 text-left transition ${active ? 'bg-indigo-50 ring-1 ring-indigo-100' : 'hover:bg-white'}`}>
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}><Glyph size={17} /></span>
                <span className="min-w-0 flex-1"><span className={`block truncate text-sm font-semibold ${active ? 'text-indigo-900' : 'text-slate-800'}`}>{room.name}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{club?.name ?? 'Club'}</span><span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">{room.room_type === 'core' ? 'Core Team' : room.room_type === 'members' ? 'Members' : 'General'}</span></span>
              </button>;
            })}
          </div>
          <div className="m-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-950"><strong>Access levels</strong><br />General · all confirmed institute-email accounts<br />Members · active club members and coordinator<br />Core Team · Core Members and coordinator</div>
        </aside>

        <section className="flex min-h-[600px] min-w-0 flex-col">
          {activeRoom ? (
            <>
              <header className="border-b border-slate-200 px-4 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><MessageCircle size={20} /></div>
                  <div className="min-w-0 flex-1"><h2 className="truncate font-bold text-slate-900">{activeClub?.name ?? 'Club'} · {activeRoom.name}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{roomDescriptions[activeRoom.room_type]}</p></div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600"><LockKeyhole size={11} />{activeRoom.room_type}</span>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
                {loadingMessages ? <div className="flex items-center justify-center py-16 text-sm text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={17} /> Loading messages…</div> : messages.length === 0 ? (
                  <div className="mx-auto max-w-sm py-20 text-center"><MessageCircle size={31} className="mx-auto mb-3 text-slate-300" /><h3 className="font-semibold text-slate-800">Start the discussion</h3><p className="mt-1 text-sm leading-6 text-slate-500">This room has no messages yet. Send the first message to people who have access to this room.</p></div>
                ) : messages.map((message) => {
                  const mine = message.sender_id === userId;
                  return <div key={message.id} className={`flex items-start gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                    {message.profiles?.avatar_url ? <img src={message.profiles.avatar_url} alt="" className="mt-1 h-8 w-8 shrink-0 rounded-full object-cover" /> : <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">{(message.profiles?.display_name ?? '?').slice(0,1).toUpperCase()}</span>}
                    <div className={`max-w-[84%] min-w-0 ${mine ? 'text-right' : ''}`}>
                      <div className={`mb-1 flex flex-wrap items-baseline gap-2 text-xs ${mine ? 'justify-end' : ''}`}><span className="font-semibold text-slate-800">{mine ? 'You' : message.profiles?.display_name ?? 'Campus member'}</span><time className="text-[10px] text-slate-400">{timeLabel(message.created_at)}</time></div>
                      <div className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-left text-sm leading-6 ${mine ? 'rounded-tr-sm bg-indigo-600 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800'}`}>{message.content}</div>
                    </div>
                  </div>;
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-3 sm:p-4">
                <label htmlFor="roomMessage" className="sr-only">Write a message</label>
                <div className="flex items-end gap-2">
                  <textarea id="roomMessage" rows={2} maxLength={5000} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${activeRoom.name}…`} className="max-h-40 min-h-[48px] flex-1 resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                  <button type="submit" disabled={sending || !draft.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{sending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}<span className="hidden sm:inline">Send</span></button>
                </div>
                <p className="mt-2 text-[10px] leading-4 text-slate-400">Messages are visible only to users authorized for this room. Campus leaders do not automatically receive access to personal direct messages.</p>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center"><LockKeyhole size={32} className="mb-3 text-slate-300" /><h2 className="font-bold text-slate-800">Choose a room</h2><p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Room access is granted by approved club membership and leadership role.</p></div>
          )}
        </section>
      </div>
    </div>
  );
}
