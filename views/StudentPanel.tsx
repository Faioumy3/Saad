import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Select } from '../components/UI';
import { api } from '../services/api';
import { StudentDailyRecord, Student } from '../types';
import { LogOut, Save, History, BookOpen, Key } from 'lucide-react';

interface StudentPanelProps {
  student: Student;
  onLogout: () => void;
}

export const StudentPanel: React.FC<StudentPanelProps> = ({ student, onLogout }) => {
  const [logs, setLogs] = useState<StudentDailyRecord[]>([]);
  const [form, setForm] = useState<Partial<StudentDailyRecord>>({
    newMemorizing: '',
    review: '',
    listening: '',
    newTarget: '',
    notes: ''
  });

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');

  useEffect(() => {
    if(student.code) {
        // Fetch logs fresh from API whenever the component mounts or student code changes
        setLogs(api.getStudentLogs(student.code));
    }
  }, [student.code]);

  const handleSubmit = () => {
    // 1. Validation
    if (!form.newMemorizing || !form.review || !form.listening || !form.newTarget) {
      alert('الرجاء إكمال جميع الحقول المطلوبة (الحفظ، المراجعة، التسميع، الهدف)');
      return;
    }

    // 2. Student Code Check
    if (!student.code) {
        alert('حدث خطأ: كود الطالب غير موجود. يرجى تسجيل الخروج والدخول مرة أخرى.');
        return;
    }

    // 3. Create Record
    const newRecord: StudentDailyRecord = {
      date: new Date().toISOString(),
      dateDisplay: new Date().toLocaleDateString('ar-EG'),
      newMemorizing: form.newMemorizing,
      review: form.review,
      listening: form.listening,
      newTarget: form.newTarget,
      notes: form.notes || ''
    };

    try {
        // 4. Save to API
        api.saveStudentLog(student.code, newRecord);
        
        // 5. Update Local State (Optimistic)
        setLogs(prevLogs => [newRecord, ...prevLogs]); 
        
        // 6. Reset Form
        setForm({ newMemorizing: '', review: '', listening: '', newTarget: '', notes: '' });
        
        // 7. Success Feedback
        alert('تم حفظ اليوميات بنجاح وتم إرسالها إلى لوحة التحكم ✓');
        
    } catch (error) {
        console.error("Save failed", error);
        alert('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleChangePassword = () => {
    if(!newPwd || newPwd.length < 4) return alert('كلمة السر يجب أن تكون 4 أحرف على الأقل');
    
    const updatedStudent = { ...student, password: newPwd };
    api.updateStudent(updatedStudent);
    
    setNewPwd('');
    alert('تم تغيير كلمة السر بنجاح. سيتم تسجيل الخروج.');
    onLogout();
  };

  return (
    <div className="pb-20">
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-white">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">مرحباً {student.name} 👋</h2>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <span>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="bg-white px-2 py-1 rounded border w-fit">الكود: {student.code}</span>
                </div>
            </div>
            <Button variant="secondary" onClick={() => setShowChangePwd(true)} className="p-2" title="تغيير كلمة السر">
                <Key className="w-5 h-5" />
            </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="تسجيل اليوميات" className="h-fit">
          <Input 
            label="📖 مقدار الحفظ الجديد" 
            placeholder="مثال: من سورة الفاتحة إلى الآية 5"
            value={form.newMemorizing}
            onChange={e => setForm({...form, newMemorizing: e.target.value})}
          />
          <Input 
            label="🔄 مقدار ورد المراجعة" 
            placeholder="مثال: سورة البقرة 1-10"
            value={form.review}
            onChange={e => setForm({...form, review: e.target.value})}
          />
          <Select 
            label="🎤 التسميع على المعلم" 
            value={form.listening} 
            onChange={e => setForm({...form, listening: e.target.value})}
          >
            <option value="">-- اختر --</option>
            <option value="نعم">✓ نعم</option>
            <option value="لا">✗ لا</option>
            <option value="جزئي">◐ جزئي</option>
          </Select>
          <Input 
            label="📍 الهدف التالي" 
            placeholder="تحديد الجديد"
            value={form.newTarget}
            onChange={e => setForm({...form, newTarget: e.target.value})}
          />
          <div className="mb-4">
             <label className="block text-gray-700 font-medium mb-2 text-right">ملاحظات</label>
             <textarea 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary text-right"
                rows={3}
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
             />
          </div>
          <Button fullWidth onClick={handleSubmit} className="flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> حفظ اليوميات
          </Button>
        </Card>

        <Card title="السجل التاريخي" className="max-h-[800px] overflow-hidden flex flex-col">
            <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
                {logs.length === 0 && (
                    <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                        <History className="w-12 h-12 mb-2 opacity-50" />
                        <p>لا توجد سجلات سابقة</p>
                    </div>
                )}
                <div className="space-y-4">
                    {logs.slice().reverse().map((log, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                                <span className="font-bold text-primary flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> {log.dateDisplay}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div><span className="font-bold text-gray-700">الحفظ:</span> {log.newMemorizing}</div>
                                <div><span className="font-bold text-gray-700">المراجعة:</span> {log.review}</div>
                                <div><span className="font-bold text-gray-700">التسميع:</span> {log.listening}</div>
                                <div><span className="font-bold text-gray-700">الهدف:</span> {log.newTarget}</div>
                            </div>
                            {log.notes && (
                                <div className="mt-3 pt-2 border-t border-gray-200 text-sm text-gray-600 bg-white p-2 rounded">
                                    <span className="font-bold">ملاحظة:</span> {log.notes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-top flex justify-center z-50">
        <Button variant="danger" onClick={onLogout} className="flex items-center gap-2 px-8">
            <LogOut className="w-4 h-4" /> خروج
        </Button>
      </div>

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