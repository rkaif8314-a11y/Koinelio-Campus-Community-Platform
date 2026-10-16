'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, LoaderCircle, Vote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type Election = {
  id: string; title: string; description: string; nominations_open_at: string;
  nominations_close_at: string; voting_opens_at: string; voting_closes_at: string;
  status: 'draft'|'open'|'closed'|'published'|'cancelled'; created_by: string;
};
type Candidate = { id: string; election_id: string; candidate_id: string; statement: string; nominated_at: string; profiles?: { display_name: string; department: string|null }|null };
type Result = { candidate_row_id: string; candidate_id: string; display_name: string; vote_count: number };
const inputClass='w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-emerald-600/20';
const buttonClass='inline-flex items-center justify-center gap-2 rounded-xl bg-[#173D36] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';

export default function ElectionsPage() {
 const router=useRouter();
 const [userId,setUserId]=useState('');
 const [isAdmin,setIsAdmin]=useState(false);
 const [elections,setElections]=useState<Election[]>([]);
 const [candidates,setCandidates]=useState<Candidate[]>([]);
 const [results,setResults]=useState<Record<string,Result[]>>({});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState('');
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [title,setTitle]=useState('');
 const [description,setDescription]=useState('');
 const [nomOpen,setNomOpen]=useState('');
 const [nomClose,setNomClose]=useState('');
 const [voteOpen,setVoteOpen]=useState('');
 const [voteClose,setVoteClose]=useState('');
 const [statements,setStatements]=useState<Record<string,string>>({});
 const [showCreate,setShowCreate]=useState(false);

 const load=useCallback(async()=>{
  setLoading(true);setError('');
  try{
   const {data:auth,error:authError}=await supabase.auth.getUser();
   if(authError||!auth.user){router.replace('/auth/signin?next=/dashboard/elections');return;}
   setUserId(auth.user.id);
   const {data:roleRows,error:roleError}=await supabase.from('institution_roles').select('role').eq('user_id',auth.user.id).eq('status','active');
   if(roleError)throw roleError;
   setIsAdmin((roleRows??[]).some((r:{role:string})=>['institution_admin','president'].includes(r.role)));
   const {data:rows,error:rowsError}=await supabase.from('campus_elections').select('id,title,description,nominations_open_at,nominations_close_at,voting_opens_at,voting_closes_at,status,created_by').order('created_at',{ascending:false}).limit(50);
   if(rowsError)throw rowsError;
   setElections((rows??[]) as Election[]);
   const ids=(rows??[]).map((e:{id:string})=>e.id);
   if(ids.length){
    const {data:candidateRows,error:candidateError}=await supabase.from('campus_election_candidates').select('id,election_id,candidate_id,statement,nominated_at,profiles:profiles!campus_election_candidates_candidate_id_fkey(display_name,department)').in('election_id',ids).order('nominated_at');
    if(candidateError)throw candidateError;
    setCandidates((candidateRows??[]) as unknown as Candidate[]);
   }else setCandidates([]);
   const published=(rows??[]).filter((e:{status:string})=>e.status==='published');
   const resultPairs=await Promise.all(published.map(async(e:{id:string})=>{
    const {data,error:resultError}=await supabase.rpc('get_campus_election_results',{p_election_id:e.id});
    if(resultError)throw resultError;
    return [e.id,(data??[]) as Result[]] as const;
   }));
   setResults(Object.fromEntries(resultPairs));
  }catch(e){setError(supabaseErrorMessage(e,'Unable to load elections.'));}
  finally{setLoading(false);}
 },[router]);
 // eslint-disable-next-line react-hooks/set-state-in-effect -- Load current election records after session validation.
 useEffect(()=>{void load();},[load]);

 async function createElection(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setSaving('create');setError('');setNotice('');
  try{
   const {error:rpcError}=await supabase.rpc('create_campus_election',{
    p_title:title.trim(),p_description:description.trim(),
    p_nominations_open_at:new Date(nomOpen).toISOString(),p_nominations_close_at:new Date(nomClose).toISOString(),
    p_voting_opens_at:new Date(voteOpen).toISOString(),p_voting_closes_at:new Date(voteClose).toISOString()
   });
   if(rpcError)throw rpcError;
   setTitle('');setDescription('');setShowCreate(false);setNotice('Election created. Its windows and permissions are enforced by the database.');await load();
  }catch(e){setError(supabaseErrorMessage(e,'Unable to create election. Check the dates and administrator access.'));}
  finally{setSaving('');}
 }
 async function nominate(election:Election){
  setSaving(election.id);setError('');setNotice('');
  try{
   const {error:rpcError}=await supabase.rpc('nominate_campus_election_candidate',{p_election_id:election.id,p_statement:(statements[election.id]??'').trim()});
   if(rpcError)throw rpcError;
   setNotice('Nomination submitted.');setStatements(v=>({...v,[election.id]:''}));await load();
  }catch(e){setError(supabaseErrorMessage(e,'Unable to submit nomination. The nomination window may be closed or you may have nominated already.'));}
  finally{setSaving('');}
 }
 async function vote(election:Election,candidate:Candidate){
  setSaving(election.id);setError('');setNotice('');
  try{
   const {error:rpcError}=await supabase.rpc('cast_campus_election_vote',{p_election_id:election.id,p_candidate_row_id:candidate.id});
   if(rpcError)throw rpcError;
   setNotice('Your vote was recorded. Your candidate choice is not linked to your account in the ballot table.');await load();
  }catch(e){setError(supabaseErrorMessage(e,'Unable to cast vote. Voting may be closed, you may be ineligible, or you may already have voted.'));}
  finally{setSaving('');}
 }
 async function publish(election:Election){
  setSaving(election.id);setError('');setNotice('');
  try{const {error:rpcError}=await supabase.rpc('publish_campus_election_results',{p_election_id:election.id});if(rpcError)throw rpcError;setNotice('Results published.');await load();}
  catch(e){setError(supabaseErrorMessage(e,'Results cannot be published yet. Voting must be over and you must have administrator access.'));}
  finally{setSaving('');}
 }
 if(loading)return <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--app-muted)]"><LoaderCircle size={18} className="mr-2 animate-spin"/>Loading elections…</div>;
 return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
  <header className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Campus governance</p><h1 className="mt-1 text-3xl font-bold text-[var(--app-text)]">Elections</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">Separate nomination and voting windows, database-enforced one-person-one-vote, private ballots, and authorised result publication.</p></div>{isAdmin&&<button type="button" onClick={()=>setShowCreate(v=>!v)} className={buttonClass}><Vote size={16}/>Create election</button>}</header>
  {error&&<div role="alert" className="mb-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17}/>{error}</div>}
  {notice&&<div role="status" className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17}/>{notice}</div>}
  {showCreate&&isAdmin&&<form onSubmit={createElection} className="mb-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5"><h2 className="font-bold text-[var(--app-text)]">Create election</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Title<input required minLength={3} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} className={inputClass}/></label><label className="text-xs font-semibold sm:col-span-2">Description<textarea maxLength={5000} rows={3} value={description} onChange={e=>setDescription(e.target.value)} className={inputClass}/></label><label className="text-xs font-semibold">Nominations open<input required type="datetime-local" value={nomOpen} onChange={e=>setNomOpen(e.target.value)} className={inputClass}/></label><label className="text-xs font-semibold">Nominations close<input required type="datetime-local" value={nomClose} onChange={e=>setNomClose(e.target.value)} className={inputClass}/></label><label className="text-xs font-semibold">Voting opens<input required type="datetime-local" value={voteOpen} onChange={e=>setVoteOpen(e.target.value)} className={inputClass}/></label><label className="text-xs font-semibold">Voting closes<input required type="datetime-local" value={voteClose} onChange={e=>setVoteClose(e.target.value)} className={inputClass}/></label></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setShowCreate(false)} className="rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm">Cancel</button><button disabled={saving==='create'} className={buttonClass}>Create election</button></div></form>}
  {elections.length===0?<div className="rounded-2xl border border-dashed border-[var(--app-border)] p-10 text-center text-sm text-[var(--app-muted)]">No elections have been published for this campus.</div>:<div className="space-y-5">{elections.map(election=>{
   const list=candidates.filter(c=>c.election_id===election.id);
   const now=Date.now();
   const nominationOpen=election.status==='open'&&now>=new Date(election.nominations_open_at).getTime()&&now<new Date(election.nominations_close_at).getTime();
   const votingOpen=election.status==='open'&&now>=new Date(election.voting_opens_at).getTime()&&now<new Date(election.voting_closes_at).getTime();
   return <article key={election.id} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-xl font-bold text-[var(--app-text)]">{election.title}</h2><p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{election.description}</p></div><span className="rounded-full bg-[var(--app-surface-muted)] px-3 py-1 text-xs font-semibold capitalize">{election.status}</span></div><div className="mt-3 grid gap-2 text-xs text-[var(--app-muted)] sm:grid-cols-2"><p>Nominations: {new Date(election.nominations_open_at).toLocaleString()} – {new Date(election.nominations_close_at).toLocaleString()}</p><p>Voting: {new Date(election.voting_opens_at).toLocaleString()} – {new Date(election.voting_closes_at).toLocaleString()}</p></div>
    {nominationOpen&&<div className="mt-4 rounded-xl bg-[var(--app-surface-muted)] p-3"><label className="block text-xs font-semibold">Candidate statement<textarea rows={2} maxLength={2500} value={statements[election.id]??''} onChange={e=>setStatements(v=>({...v,[election.id]:e.target.value}))} className={inputClass}/></label><button type="button" disabled={saving===election.id} onClick={()=>void nominate(election)} className={buttonClass+' mt-2'}>Nominate myself</button></div>}
    {list.length>0&&<div className="mt-4 space-y-3"><h3 className="text-sm font-bold text-[var(--app-text)]">Candidates ({list.length})</h3>{list.map(candidate=><div key={candidate.id} className="rounded-xl border border-[var(--app-border)] p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold text-[var(--app-text)]">{candidate.profiles?.display_name??'Campus candidate'}</p><p className="text-xs text-[var(--app-muted)]">{candidate.profiles?.department??'Department not listed'}</p></div>{votingOpen&&candidate.candidate_id!==userId&&<button type="button" disabled={saving===election.id} onClick={()=>void vote(election,candidate)} className={buttonClass}>Vote</button>}</div>{candidate.statement&&<p className="mt-2 whitespace-pre-line text-sm text-[var(--app-muted)]">{candidate.statement}</p>}</div>)}</div>}
    {election.status==='open'&&new Date(election.voting_closes_at).getTime()<=Date.now()&&isAdmin&&<button type="button" disabled={saving===election.id} onClick={()=>void publish(election)} className={buttonClass+' mt-4'}>Close and publish results</button>}
    {results[election.id]&&<section className="mt-4 rounded-xl bg-[var(--app-surface-muted)] p-3"><h3 className="font-bold text-[var(--app-text)]">Published results</h3>{results[election.id].map(row=><div key={row.candidate_row_id} className="flex justify-between gap-3 border-b border-[var(--app-border)] py-2 text-sm last:border-0"><span>{row.display_name}</span><strong>{row.vote_count} votes</strong></div>)}</section>}
   </article>;
  })}</div>}
  <p className="mt-6 text-xs leading-5 text-[var(--app-muted)]">This initial elections workflow must be independently security-tested in staging before use for any consequential campus election. Secret ballot storage is separated from the voter participation record, but the platform still requires governance rules, eligibility review, and a formal audit before real elections.</p>
 </main>;
}
