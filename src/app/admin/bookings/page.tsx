"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Search, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

type BookingStatus = "pending"|"accepted"|"dispatched"|"in_progress"|"completed"|"cancelled";
const STATUS_CONFIG: Record<BookingStatus,{label:string;color:string}> = {
  pending:     {label:"Pending",    color:"text-warning bg-warning/10 border-warning/20"},
  accepted:    {label:"Accepted",   color:"text-primary bg-primary/10 border-primary/20"},
  dispatched:  {label:"Dispatched", color:"text-blue-400 bg-blue-400/10 border-blue-400/20"},
  in_progress: {label:"In Progress",color:"text-orange-400 bg-orange-400/10 border-orange-400/20"},
  completed:   {label:"Completed",  color:"text-success bg-success/10 border-success/20"},
  cancelled:   {label:"Cancelled",  color:"text-destructive bg-destructive/10 border-destructive/20"},
};

interface Booking { id:string; booking_number:string; status:BookingStatus; estimated_price?:number; final_price?:number; scheduled_date:string; service?:{name:string}; customer?:{user?:{name?:string}}; garage?:{name:string}; }

const TABS: {key:BookingStatus|"all";label:string}[] = [
  {key:"all",label:"All"},{key:"pending",label:"Pending"},{key:"in_progress",label:"Active"},{key:"completed",label:"Completed"},{key:"cancelled",label:"Cancelled"},
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<BookingStatus|"all">("all");

  useEffect(() => {
    fetch("/api/bookings").then((r)=>r.json()).then((d)=>setBookings(d.bookings??[])).finally(()=>setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const matchSearch = search==="" || b.booking_number.toLowerCase().includes(search.toLowerCase()) || (b.customer as {user?:{name?:string}})?.user?.name?.toLowerCase().includes(search.toLowerCase()) || b.garage?.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab==="all" || b.status===tab;
    return matchSearch && matchTab;
  });

  const totalRevenue = bookings.filter(b=>b.status==="completed").reduce((s,b)=>s+(b.final_price??b.estimated_price??0),0);

  return (
    <div className="min-h-screen bg-background md:pl-60">
      <div className="p-4 md:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">All Bookings</h1>
        <p className="text-muted-foreground text-sm mb-6">Platform-wide booking oversight</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">{bookings.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-warning">{bookings.filter(b=>b.status==="pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-success">{bookings.filter(b=>b.status==="completed").length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
          <div className="glass-card p-3 text-center"><p className="text-xl font-bold text-foreground">â‚¹{(totalRevenue/1000).toFixed(1)}k</p><p className="text-xs text-muted-foreground">Revenue</p></div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search booking ID, customer, or garage..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map(({key,label})=>{
            const count = key==="all"?bookings.length:bookings.filter(b=>b.status===key).length;
            return <button key={key} onClick={()=>setTab(key)} className={cn("flex-none px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap", tab===key?"bg-primary text-white border-primary":"bg-card text-muted-foreground border-border")}>{label}{count>0&&<span className="ml-1 opacity-70">({count})</span>}</button>;
          })}
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-24 bg-card rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length===0 ? (
          <div className="text-center py-12"><CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40"/><p className="text-muted-foreground text-sm">No bookings found</p></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((b)=>{
              const status = STATUS_CONFIG[b.status];
              return (
                <div key={b.id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground font-mono">{b.booking_number}</span><span className={cn("text-xs px-2 py-0.5 rounded-full border",status.color)}>{status.label}</span></div>
                      <p className="text-sm font-semibold text-foreground mt-1">{(b.customer as {user?:{name?:string}})?.user?.name ?? "Customer"}</p>
                      <p className="text-xs text-muted-foreground">{b.garage?.name}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-sm font-bold text-foreground flex-none"><IndianRupee className="w-3.5 h-3.5"/>{(b.final_price??b.estimated_price??0).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                    <span>{b.service?.name}</span>
                    <div className="flex items-center gap-1"><CalendarDays className="w-3 h-3"/>{new Date(b.scheduled_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

