import { h } from '../jsx';
interface Props { label: string; value: string | number; detail: string; tone?: 'slate' | 'blue' | 'amber' | 'green'; }
const valueTone: Record<string,string> = {slate:'text-slate-950',blue:'text-blue-700',amber:'text-amber-700',green:'text-emerald-700'};
const dotTone: Record<string,string> = {slate:'bg-slate-400',blue:'bg-blue-500',amber:'bg-amber-500',green:'bg-emerald-500'};
export function AdminStatCard(props: Props) {
 const tone=props.tone||'slate';
 return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[.02] sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-500">{props.label}</p><span className={'h-2.5 w-2.5 rounded-full ring-4 ring-slate-100 '+dotTone[tone]}/></div><p className={'mt-3 break-words text-2xl font-extrabold tracking-tight sm:text-[28px] '+valueTone[tone]}>{props.value}</p><p className="mt-1 text-[11px] text-slate-400">{props.detail}</p></article>;
}