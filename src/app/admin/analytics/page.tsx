"use client";

import { useState, useEffect } from "react";
import { TrendingUp, IndianRupee, Users, Building2, ShoppingBag, Star, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Stats { total_garages:number; pending_garages:number; total_customers:number; total_bookings:number; completed_bookings:number; pending_bookings:number; total_revenue:number; }
interface Booking { id:string; status:string; estimated_price?:number; final_price?:number; created_at:string; service?:{name:string;category:string}; garage?:{name:string;city?:string;rating?:number}; }

const PIE_COLORS = ["#7C3AED","#10B981","#F59E0B","#3B82F6","#6B7280"];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats|null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then(r=>r.json()).catch(()=>null),
      fetch("/api/bookings").then(r=>r.json()).catch(()=>({bookings:[]})),
    ]).then(([s,b])=>{
      setStats(s);
      setBookings(b.bookings??[]);
    }).finally(()=>setLoading(false));
  }, []);

  // Monthly chart
  const monthlyMap: Record<string,{bookings:number;revenue:number}> = {};
  bookings.forEach((b)=>{
    const month = new Date(b.created_at).toLocaleString("en-IN",{month:"short"});
    if (!monthlyMap[month]) monthlyMap[month]={bookings:0,revenue:0};
    monthlyMap[month].bookings++;
    if (b.status==="completed") monthlyMap[month].revenue += b.final_price??b.estimated_price??0;
  });
  const chartData = Object.entries(monthlyMap).map(([month,v])=>({month,...v})).slice(-6);

  // Service split
  const categoryMap: Record<string,number> = {};
  bookings.forEach((b)=>{ const cat = b.service?.category??"other"; categoryMap[cat]=(categoryMap[cat]??0)+1; });
  const pieData = Object.entries(categoryMap).map(([name,value])=>({name:name.replace("_"," "),value}));

  // Top garages
  const garageMap: Record<string,{name:string;city?:string;bookings:number;revenue:number;rating?:number}> = {};
  bookings.forEach((b)=>{ if (!b.garage?.name) return; const g=b.garage.name; if (!garageMap[g]) garageMap[g]={name:g,city:b.garage.city,bookings:0,revenue:0,rating:b.garage.rating}; garageMap[g].bookings++; if(b.status==="completed") garageMap[g].revenue+=b.final_price??b.estimated_price??0; });
  const topGarages = Object.values(garageMap).sort((a,b)=>b.revenue-a.revenue).slice(0,5);

  return (
    <div className="min-h-screen bg-background md:pl-60">
      <div className="p-4 md:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Analytics</h1>
        <p className="text-muted-foreground text-sm mb-6">Platform-wide revenue and usage insights</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {label:"Total Revenue",value:`₹${((stats?.total_revenue??0)/1000).toFixed(0)}k`,icon:IndianRupee,color:"text-success"},
            {label:"Total Bookings",value:String(stats?.total_bookings??0),icon:ShoppingBag,color:"text-primary"},
            {label:"Active Garages",value:String((stats?.total_garages??0)-(stats?.pending_garages??0)),icon:Building2,color:"text-warning"},
            {label:"Customers",value:String(stats?.total_customers??0),icon:Users,color:"text-blue-400"},
          ].map(({label,value,icon:Icon,color})=>(
            <div key={label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${color}`}/><span className="text-xs text-muted-foreground">{label}</span></div>
              <p className="text-xl font-bold text-foreground">{loading?"…":value}</p>
            </div>
          ))}
        </div>

        {chartData.length > 0 && (
          <div className="glass-card p-4 mb-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Bookings & Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D35" vertical={false}/>
                <XAxis dataKey="month" tick={{fill:"#71717A",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="left" tick={{fill:"#71717A",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="right" orientation="right" tick={{fill:"#71717A",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{backgroundColor:"#1A1A1F",border:"1px solid #2D2D35",borderRadius:8,color:"#F4F4F5"}}/>
                <Bar yAxisId="left" dataKey="bookings" fill="#7C3AED" radius={[4,4,0,0]} name="Bookings"/>
                <Bar yAxisId="right" dataKey="revenue" fill="#10B981" radius={[4,4,0,0]} name="Revenue (₹)" opacity={0.7}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {pieData.length > 0 && (
            <div className="glass-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4">Bookings by Service</h2>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart><Pie data={pieData} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={2}>
                    {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie></PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 flex-1">
                  {pieData.map((s,i)=>(
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-none" style={{backgroundColor:PIE_COLORS[i%PIE_COLORS.length]}}/>
                      <span className="text-xs text-muted-foreground flex-1 capitalize truncate">{s.name}</span>
                      <span className="text-xs font-medium text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Platform Health</h2>
            <div className="space-y-3">
              {[
                {label:"Completion Rate",value:stats?`${Math.round(((stats.completed_bookings??0)/(stats.total_bookings||1))*100)}%`:"—",note:"Bookings completed vs total"},
                {label:"Pending Approvals",value:String(stats?.pending_garages??0),note:"Garages awaiting review"},
                {label:"Total Garages",value:String(stats?.total_garages??0),note:"On platform"},
                {label:"Active Bookings",value:String(stats?.pending_bookings??0),note:"Currently in progress"},
              ].map(({label,value,note})=>(
                <div key={label} className="flex items-center justify-between">
                  <div><p className="text-xs font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{note}</p></div>
                  <span className="text-sm font-bold text-foreground">{loading?"…":value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {topGarages.length > 0 && (
          <div className="glass-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Top Garages by Revenue</h2>
            <div className="space-y-3">
              {topGarages.map((g,i)=>(
                <div key={g.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i+1}</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{g.name}</p><p className="text-xs text-muted-foreground">{g.city} · {g.bookings} bookings</p></div>
                  <div className="text-right flex-none">
                    <p className="text-sm font-bold text-foreground">₹{(g.revenue/1000).toFixed(1)}k</p>
                    {g.rating&&<div className="flex items-center gap-0.5 justify-end"><Star className="w-3 h-3 text-warning fill-warning"/><span className="text-xs text-muted-foreground">{g.rating}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
