import React, { useState } from 'react';
import { ViewState, UserSession } from './types';
import { Home } from './views/Home';
import { AdminPanel } from './views/AdminPanel';
import { TeacherPanel } from './views/TeacherPanel';
import { StudentPanel } from './views/StudentPanel';
import { Login } from './views/Login';
import { User } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [session, setSession] = useState<UserSession | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleLoginSuccess = (userType: UserSession['type'], data?: any) => {
    setSession({ type: userType, data });
    if (userType === 'admin') setView('DASHBOARD_ADMIN');
    if (userType === 'teacher') setView('DASHBOARD_TEACHER');
    if (userType === 'student') setView('DASHBOARD_STUDENT');
  };

  const handleLogout = () => {
    setSession(null);
    setView('HOME');
  };

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return <Home onNavigate={setView} />;
      
      case 'LOGIN_TEACHER':
      case 'LOGIN_ADMIN':
      case 'LOGIN_STUDENT':
      case 'REGISTER_STUDENT':
        return (
          <Login 
            view={view} 
            onNavigate={setView} 
            onLoginSuccess={handleLoginSuccess} 
          />
        );

      case 'DASHBOARD_ADMIN':
        return session?.type === 'admin' ? <AdminPanel onLogout={handleLogout} /> : <Home onNavigate={setView} />;

      case 'DASHBOARD_TEACHER':
        return session?.type === 'teacher' ? <TeacherPanel teacher={session.data} onLogout={handleLogout} /> : <Home onNavigate={setView} />;

      case 'DASHBOARD_STUDENT':
        return session?.type === 'student' ? <StudentPanel student={session.data} onLogout={handleLogout} /> : <Home onNavigate={setView} />;
      
      default:
        return <Home onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-100 flex justify-center items-start pt-0 md:pt-4">
      {/* Container simulating mobile app dimensions */}
      <div className="w-full max-w-md bg-gradient-to-br from-bgStart to-bgEnd min-h-screen shadow-2xl relative flex flex-col md:rounded-xl overflow-hidden border-x border-gray-200">
        
        {/* Sticky Header - Distinct Background, One Line Title */}
        <header className="sticky top-0 z-50 bg-secondary text-white shadow-md">
            <div className="px-4 py-3 flex items-center gap-3 w-full">
              {/* Profile Image / Fallback */}
              <div className="shrink-0">
                {imageError ? (
                   <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                      <User className="w-6 h-6 text-white/90" />
                   </div>
                ) : (
                  <img 
                    src="/sheikh.jpg" 
                    alt="الشيخ" 
                    className="w-10 h-10 rounded-full object-cover border border-white/40 shadow-sm bg-white"
                    onError={(e) => {
                      setImageError(true);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              
              {/* Title - Forced One Line */}
              <h1 className="text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis flex-1 leading-relaxed pt-1" title="مكتب تحفيظ الشيخ سعد بن محمود أبو نوارج">
                مكتب تحفيظ الشيخ سعد بن محمود أبو نوارج
              </h1>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 pb-24 overflow-x-hidden">
          {renderContent()}
        </main>

        {/* Footer - WhatsApp */}
        <footer className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-3 px-6 z-40 border-t border-gray-100">
          <div className="flex justify-center items-center gap-3 text-sm font-bold text-gray-700">
              <span className="text-gray-500 text-xs">تواصل معنا:</span>
              <a href="https://wa.me/201060936428" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors bg-green-50 px-3 py-1.5 rounded-full">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.951 1.263l-.355.192-.368-.06 1.41 5.209.9.003c1.231-1.187 2.927-1.9 4.773-1.9 4.97 0 9.005 4.028 9.005 9.009 0 4.983-4.032 9.015-9.009 9.015-4.981 0-9.01-4.032-9.01-9.015 0-1.946.648-3.835 1.8-5.36l.134-.341-.086-.368-1.41-5.209-.37-.056.192-.355A9.87 9.87 0 0112.051 2c5.495 0 9.973 4.478 9.973 9.973 0 5.495-4.478 9.973-9.973 9.973-5.495 0-9.973-4.478-9.973-9.973 0-2.15.697-4.243 1.977-6.004"/>
                  </svg>
                  <span className="font-amiri font-bold pt-1 text-sm">01060936428</span>
              </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;