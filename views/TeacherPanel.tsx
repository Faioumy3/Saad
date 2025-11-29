import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '../components/UI';
import { api } from '../services/api';
import { Teacher, Student } from '../types';
import { Check, X, LogOut, UserPlus, Trash2, Key } from 'lucide-react';

interface TeacherPanelProps {
  teacher: Teacher;
  onLogout: () => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({ teacher, onLogout }) => {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher>(teacher);
  const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent' | null, notes: string }>>({});
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  
  // Manage Student State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');

  // Password State
  const [newPwd, setNewPwd] = useState('');

  useEffect(() => {
    // Refresh teacher data from storage to get latest students
    const teachers = api.getTeachers();
    const updated = teachers[teacher.code];
    if (updated) {
      setCurrentTeacher(updated);
      
      // Init attendance
      const initialAtt: Record<string, any> = {};
      updated.students?.forEach(s => {
        initialAtt[s.name] = { status: null, notes: '' };
      });
      setAttendance(initialAtt);
    }
  }, [teacher.code]);

  const handleStatus = (name: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({
      ...prev,
      [name]: { ...prev[name], status: prev[name]?.status === status ? null : status }
    }));
  };

  const handleNote = (name: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [name]: { ...prev[name], notes }
    }));
  };

  const saveAttendance = () => {
    const records = Object.entries(attendance)
      .filter(([_, data]) => data.status !== null)
      .map(([name, data]) => ({
        id: `${Date.now()}-${Math.random()}`,
        teacherCode: currentTeacher.code,
        studentName: name,
        status: data.status as 'present' | 'absent',
        notes: data.notes,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      }));

    if (records.length === 0) return alert('الرجاء تحديد حالة الحضور');

    api.saveAttendanceBatch(records);
    alert('تم حفظ البيانات بنجاح ✓');
    onLogout();
  };

  // Student Management Logic
  const handleAddStudent = () => {
    if(!newStudentName || !newStudentId) return alert('البيانات ناقصة');
    
    const updatedTeacher = { ...currentTeacher };
    if(!updatedTeacher.students) updatedTeacher.students = [];
    
    if(updatedTeacher.students.some(s => s.id === newStudentId)) return alert('رقم الهوية موجود مسبقاً');
    
    updatedTeacher.students.push({ id: newStudentId, name: newStudentName });
    api.saveTeacher(updatedTeacher);
    setCurrentTeacher(updatedTeacher);
    setNewStudentName('');
    setNewStudentId('');
    alert('تم إضافة الطالب');
  };

  const handleDeleteStudent = (id: string) => {
    if(confirm('حذف الطالب؟')) {
      const updatedTeacher = { ...currentTeacher };
      updatedTeacher.students = updatedTeacher.students.filter(s => s.id !== id);
      api.saveTeacher(updatedTeacher);
      setCurrentTeacher(updatedTeacher);
    }
  };

  const handleChangePassword = () => {
    if(!newPwd || newPwd.length < 4) return alert('كلمة السر يجب أن تكون 4 أحرف على الأقل');
    const updatedTeacher = { ...currentTeacher, password: newPwd };
    api.saveTeacher(updatedTeacher);
    setCurrentTeacher(updatedTeacher);
    setNewPwd('');
    alert('تم تغيير كلمة السر بنجاح');
    setShowChangePwd(false);
  };

  return (
    <div className="pb-24">
      <Card className="mb-6 bg-white/90 backdrop-blur-sm sticky top-4 z-40 border border-green-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-secondary">تسجيل الحضور</h2>
            <div className="text-primary text-sm mt-1">{currentTeacher.name} - {new Date().toLocaleDateString('ar-EG')}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowChangePwd(true)} className="px-3 py-2 text-sm" title="تغيير كلمة السر">
               <Key className="w-4 h-4" />
            </Button>
            <Button variant="accent" onClick={() => setShowManageStudents(true)} className="px-4 py-2 text-sm">
              <SettingsIcon className="w-4 h-4 inline ml-1" /> إدارة الطلاب
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {currentTeacher.students?.map(student => {
            const data = attendance[student.name] || { status: null, notes: '' };
            return (
              <div key={student.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md">
                <div className="flex-1 w-full md:w-auto text-right">
                  <div className="font-bold text-lg text-secondary">{student.name}</div>
                  <input 
                    type="text" 
                    placeholder="ملاحظات..." 
                    className="w-full mt-2 p-2 text-sm border rounded bg-gray-50 focus:bg-white transition-colors"
                    value={data.notes}
                    onChange={e => handleNote(student.name, e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => handleStatus(student.name, 'absent')}
                    className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold border-2 transition-all flex items-center justify-center gap-2 ${data.status === 'absent' ? 'bg-red-500 text-white border-red-500 shadow-lg scale-105' : 'bg-red-50 text-red-500 border-transparent hover:bg-red-100'}`}
                  >
                    <X className="w-4 h-4" /> غائب
                  </button>
                  <button 
                    onClick={() => handleStatus(student.name, 'present')}
                    className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold border-2 transition-all flex items-center justify-center gap-2 ${data.status === 'present' ? 'bg-green-500 text-white border-green-500 shadow-lg scale-105' : 'bg-green-50 text-green-500 border-transparent hover:bg-green-100'}`}
                  >
                    <Check className="w-4 h-4" /> حاضر
                  </button>
                </div>
              </div>
            );
        })}
        {(!currentTeacher.students || currentTeacher.students.length === 0) && (
            <div className="text-center text-gray-400 py-8">لا يوجد طلاب مسجلين</div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 flex justify-between gap-4 z-50">
        <Button variant="danger" onClick={onLogout} className="flex-1 md:flex-none">
          <LogOut className="w-4 h-4 inline ml-2" /> خروج
        </Button>
        <Button onClick={saveAttendance} className="flex-[2] md:flex-none md:min-w-[200px]">
          حفظ البيانات
        </Button>
      </div>

      {/* Manage Students Modal */}
      {showManageStudents && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" title="إدارة الطلاب">
            <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-secondary mb-3 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> إضافة طالب جديد
                    </h4>
                    <Input label="اسم الطالب" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} />
                    <Input label="رقم الهوية / الكود" value={newStudentId} onChange={e => setNewStudentId(e.target.value)} />
                    <Button fullWidth onClick={handleAddStudent} variant="accent" className="mt-2">إضافة</Button>
                </div>
                
                <h4 className="font-bold text-gray-700 mb-2">قائمة الطلاب الحالية</h4>
                <div className="space-y-2">
                    {currentTeacher.students?.map(s => (
                        <div key={s.id} className="flex justify-between items-center p-3 border rounded bg-white">
                            <div>
                                <div className="font-bold text-gray-800">{s.name}</div>
                                <div className="text-xs text-gray-500">{s.id}</div>
                            </div>
                            <button onClick={() => handleDeleteStudent(s.id)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t">
                <Button fullWidth variant="secondary" onClick={() => setShowManageStudents(false)}>إغلاق</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePwd && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-md" title="تغيير كلمة السر">
            <Input label="كلمة السر الجديدة" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            <div className="flex gap-2 mt-4">
              <Button fullWidth variant="secondary" onClick={() => setShowChangePwd(false)}>إلغاء</Button>
              <Button fullWidth onClick={handleChangePassword}>حفظ</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Helper Icon
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
)