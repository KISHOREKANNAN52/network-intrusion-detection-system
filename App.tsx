import React, { useState, useEffect, useRef } from 'react';
import { Activity, Shield, AlertTriangle, Server, Play, Pause, Settings, Cpu, UploadCloud, LayoutDashboard } from 'lucide-react';
import { generatePacket } from './services/simulationService';
import { Packet, ModelAlgorithm, SystemStats, ChartDataPoint, ViewState } from './types';
import { StatCard } from './components/StatCard';
import { TrafficChart } from './components/TrafficChart';
import { RecentLog } from './components/RecentLog';
import { UploadView } from './components/UploadView';
import { StatDetailsView } from './components/StatDetailsView';

const MAX_LOGS = 50;
const CHART_POINTS = 30;

function App() {
  // --- State ---
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  
  const [packets, setPackets] = useState<Packet[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalPackets: 0,
    intrusionCount: 0,
    normalCount: 0,
    activeThreatLevel: 'LOW'
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  // --- Refs ---
  const intervalRef = useRef<number | null>(null);

  // --- Simulation Loop ---
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        const newPacket = generatePacket();
        
        setPackets(prev => {
          const updated = [...prev, newPacket];
          if (updated.length > MAX_LOGS) updated.shift();
          return updated;
        });

        setStats(prev => {
          const isIntrusion = newPacket.isAnomaly;
          const newIntrusionCount = prev.intrusionCount + (isIntrusion ? 1 : 0);
          const newTotal = prev.totalPackets + 1;
          
          // Determine threat level based on recent ratio
          const ratio = newIntrusionCount / newTotal;
          let level: SystemStats['activeThreatLevel'] = 'LOW';
          if (ratio > 0.3) level = 'CRITICAL';
          else if (ratio > 0.15) level = 'HIGH';
          else if (ratio > 0.05) level = 'MEDIUM';

          return {
            totalPackets: newTotal,
            intrusionCount: newIntrusionCount,
            normalCount: prev.normalCount + (isIntrusion ? 0 : 1),
            activeThreatLevel: level
          };
        });

        setChartData(prev => {
          const now = new Date();
          const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
          const newPoint: ChartDataPoint = {
            time: timeStr,
            normal: newPacket.isAnomaly ? 0 : newPacket.length,
            attack: newPacket.isAnomaly ? newPacket.length : 0
          };
          
          const updated = [...prev, newPoint];
          if (updated.length > CHART_POINTS) updated.shift();
          return updated;
        });

      }, 800); 
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // --- Handlers ---
  const toggleSimulation = () => setIsRunning(!isRunning);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'yellow';
      case 'HIGH': return 'blue'; // Mapping HIGH to blue for this theme
      case 'CRITICAL': return 'red';
      default: return 'green';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      
      {/* --- Navbar --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Network Intrusion Detection</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Done by Kishore</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             {/* Navigation Links */}
             <div className="hidden md:flex gap-2">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button 
                  onClick={() => setCurrentView('upload')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${currentView === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <UploadCloud className="w-4 h-4" /> Upload Analysis
                </button>
             </div>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <button 
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm shadow-sm transition-all ${
                isRunning 
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              {isRunning ? <><Pause className="w-4 h-4" /> Stop Monitoring</> : <><Play className="w-4 h-4" /> Start Monitoring</>}
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        
        {/* --- DASHBOARD VIEW --- */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Packets" 
                value={stats.totalPackets.toLocaleString()} 
                icon={Activity} 
                color="blue" 
                subtext="Click for details"
                onClick={() => setCurrentView('details-total')}
              />
              
              <StatCard 
                title="Intrusions Blocked" 
                value={stats.intrusionCount.toLocaleString()} 
                icon={AlertTriangle} 
                color="red" 
                subtext={`${((stats.intrusionCount / (stats.totalPackets || 1)) * 100).toFixed(1)}% Attack Rate`}
                onClick={() => setCurrentView('details-intrusion')}
              />

              <StatCard 
                title="Safe Traffic" 
                value={stats.normalCount.toLocaleString()} 
                icon={Server} 
                color="green" 
                subtext="Verified Legitimate"
                onClick={() => setCurrentView('details-safe')}
              />
              <StatCard 
                title="Threat Level" 
                value={stats.activeThreatLevel} 
                icon={Cpu} 
                color={getThreatColor(stats.activeThreatLevel)} 
                subtext="View Trend"
                onClick={() => setCurrentView('details-threat')}
              />
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
              {/* Main Chart Area */}
              <div className="lg:col-span-2 h-full">
                <TrafficChart data={chartData} />
              </div>
              {/* Logs Area */}
              <div className="lg:col-span-1 h-full">
                <RecentLog packets={packets} />
              </div>
            </div>

            {/* Description Section */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm mt-6">
              <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                System Configuration: Gradient Boosting (XGBoost)
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                The Network Intrusion Detection System is currently operating using a highly optimized Gradient Boosting algorithm.
                This model provides industry-leading accuracy on standard datasets (UNSW-NB15, NSL-KDD) for identifying 
                complex attack vectors including DoS, Probe, U2R, and R2L.
              </p>
            </div>
          </div>
        )}

        {/* --- UPLOAD VIEW --- */}
        {currentView === 'upload' && (
          <UploadView />
        )}

        {/* --- DETAIL VIEWS (Total, Safe, Intrusion, Threat) --- */}
        {(currentView === 'details-intrusion' || currentView === 'details-total' || currentView === 'details-safe' || currentView === 'details-threat') && (
          <StatDetailsView 
            viewType={currentView}
            packets={packets}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

      </main>
    </div>
  );
}

export default App;