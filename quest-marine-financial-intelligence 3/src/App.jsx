import { useState } from 'react';
import { MessageSquare, LayoutDashboard, TrendingUp, Database, Moon, Sun, Anchor } from 'lucide-react';
import ChatWindow from './components/chat/ChatWindow';
import DashboardView from './components/dashboard/DashboardView';
import ScenarioView from './components/scenarios/ScenarioView';
import DataTablesView from './components/dashboard/DataTablesView';

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scenarios', label: 'Scenarios', icon: TrendingUp },
  { id: 'data', label: 'Data', icon: Database },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-navy-950 dark:via-[#0d1f3c] dark:to-[#0a1628] transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-navy-950/80 border-b border-gray-200/50 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-900 dark:bg-teal-500 flex items-center justify-center shadow-lg">
                  <Anchor className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg text-navy-900 dark:text-white leading-tight">Quest Marine</h1>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Financial Intelligence</p>
                </div>
              </div>

              {/* Nav Tabs */}
              <nav className="hidden sm:flex items-center gap-1 bg-gray-100/80 dark:bg-white/5 rounded-2xl p-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-tab flex items-center gap-2 ${activeTab === tab.id ? 'nav-tab-active' : 'nav-tab-inactive'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                {dark ? <Sun className="w-5 h-5 text-gold-400" /> : <Moon className="w-5 h-5 text-navy-900" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-navy-950/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10">
          <div className="flex justify-around py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'text-navy-900 dark:text-teal-500'
                    : 'text-gray-400'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-8">
          {activeTab === 'chat' && <ChatWindow />}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'scenarios' && <ScenarioView />}
          {activeTab === 'data' && <DataTablesView />}
        </main>
      </div>
    </div>
  );
}
