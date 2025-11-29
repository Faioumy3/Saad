import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Select, StatCard } from '../components/UI';
import { api } from '../services/api';
import { AttendanceRecord, Teacher, Student, StudentDailyRecord } from '../types';
import { Users, UserCheck, UserX, FileText, Download, Trash2, Eye, Settings, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teachers' | 'students' | 'reports' | 'settings'>('dashboard');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<Record<string, Teacher>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterTeacher, setFilterTeacher] = useState('');

  // Form states
  const [newTeacher, setNewTeacher] = useState({ name: '', code: '', password: '', email: '' });
  
  // Password Change State
  const [pwdData, setPwdData] = useState({ old: '', new: '', confirm: '' });

  // State for viewing logs
  const [selectedStudentLogs, setSelectedStudentLogs] = useState<{student: Student, logs: StudentDailyRecord[]} | null>(null);

  const refreshData = () => {
    setRecords(api.getAttendance());
    setTeachers(api.getTeachers());
    setStudents(api.getStudents());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Dashboard Logic
  const filteredRecords = records.filter(r => {
    const matchDate = filterDate ? r.date === filterDate : true;
    const matchTeacher = filterTeacher ? r.teacherCode === filterTeacher : true;
    return matchDate && matchTeacher;
  });

  const stats = {
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.status === 'present').length,
    absent: filteredRecords.filter(r => r.status === 'absent').length,
  };

  const chartData = [
    { name: 'حاضر', value: stats.present },
    { name: 'غائب', value: stats.absent },
  ];

  // Handlers
  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.code) return alert('أكمل البيانات');
    api.saveTeacher({ ...newTeacher, students: [] });
    setNewTeacher({ name: '', code: '', password: '', email: '' });
    refreshData();
    alert('تم إضافة المعلم');
  };

  const handleDeleteTeacher = (code: string) => {
    if (confirm('هل أنت متأكد؟')) {
      api.deleteTeacher(code);
      refreshData();
    }
  };

  const handleDeleteStudent = (id: string) => {
    if(confirm('حذف الطالب؟')) {
      api.deleteStudent(id);
      refreshData();
    }
  }

  const handleExportCSV = () => {
    let csv = '\uFEFFالتاريخ,المعلم,اسم الطالب,الحالة,الملاحظات\n';
    filteredRecords.forEach(r => {
      const teacherName = teachers[r.teacherCode]?.name || r.teacherCode;
      const status = r.status === 'present' ? 'حاضر' : 'غائب';
      const cleanNotes = (r.notes || '').replace(/"/g, '""');
      csv += `${r.date},"${teacherName}","${r.studentName}","${status}","${cleanNotes}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${filterDate}.csv`;
    link.click();
  };

  const handleExportStudentLogsCSV = () => {
    // Fetch all logs and map with student names
    const allData = api.exportData();
    const studentsList = api.getStudents();
    const studentMap = studentsList.reduce((acc, s) => {
        if(s.code) acc[s.code] = s.name;
        return acc;
    }, {} as Record<string, string>);

    let csv = '\uFEFFالتاريخ,اسم الطالب,الكود,الحفظ الجديد,المراجعة,التسميع,الهدف,ملاحظات\n';
    
    // Iterate over all logs in storage
    Object.entries(allData.studentLogs).forEach(([code, logs]) => {
       const name = studentMap[code] || 'غير معروف';
       logs.forEach(log => {
          const cleanNotes = (log.notes || '').replace(/"/g, '""');
          const cleanNew = (log.newMemorizing || '').replace(/"/g, '""');
          const cleanReview = (log.review || '').replace(/"/g, '""');
          const cleanTarget = (log.newTarget || '').replace(/"/g, '""');
          
          csv += `"${log.dateDisplay}","${name}","${code}","${cleanNew}","${cleanReview}","${log.listening}","${cleanTarget}","${cleanNotes}"\n`;
       });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleBackup = () => {
    const data = api.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleChangePassword = () => {
    const current = api.getAdminPassword();
    if (pwdData.old !== current) return alert('كلمة السر الحالية غير صحيحة');
    if (pwdData.new.length < 4) return alert('كلمة السر الجديدة قصيرة جداً');
    if (pwdData.new !== pwdData.confirm) return alert('كلمات السر غير متطابقة');

    api.setAdminPassword(pwdData.new);
    setPwdData({ old: '', new: '', confirm: '' });
    alert('تم تغيير كلمة السر بنجاح. يرجى إعادة الدخول.');
    onLogout();
  };

  return (
    <div className="pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex flex-col justify-between items-center gap-4 text-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary">لوحة التحكم الإدارية</h2>
          <p className="text-primary mt-1">تاريخ اليوم: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>
        <div className="flex gap-2">
           <Button variant="danger" onClick={onLogout}>خروج</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <Button variant={activeTab === 'dashboard' ? 'primary' : 'secondary'} onClick={() => setActiveTab('dashboard')} className="text-sm px-3">
           <FileText className="inline ml-1 w-4 h-4" />الرئيسية
        </Button>
        <Button variant={activeTab === 'teachers' ? 'primary' : 'secondary'} onClick={() => setActiveTab('teachers')} className="text-sm px-3">
          <Users className="inline ml-1 w-4 h-4" />المعلمين
        </Button>
        <Button variant={activeTab === 'students' ? 'primary' : 'secondary'} onClick={() => setActiveTab('students')} className="text-sm px-3">
          <Users className="inline ml-1 w-4 h-4" />الطلاب
        </Button>
        <Button variant={activeTab === 'reports' ? 'primary' : 'secondary'} onClick={() => setActiveTab('reports')} className="text-sm px-3">
          <Download className="inline ml-1 w-4 h-4" />التقارير
        </Button>
        <Button variant={activeTab === 'settings' ? 'primary' : 'secondary'} onClick={() => setActiveTab('settings')} className="text-sm px-3">
          <Settings className="inline ml-1 w-4 h-4" />الإعدادات
        </Button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <Card className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <Input label="التاريخ" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              </div>
              <div className="w-full">
                <Select label="المعلم" value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                  <option value="">الكل</option>
                  {Object.values(teachers).map(t => (
                    <option key={t.code} value={t.code}>{t.name}</option>
                  ))}
                </Select>
              </div>
              <Button onClick={refreshData} fullWidth>تحديث</Button>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <StatCard label="السجلات" value={stats.total} icon={FileText} colorClass="text-blue-600" />
            <StatCard label="حاضر" value={stats.present} icon={UserCheck} colorClass="text-green-600" />
            <StatCard label="غائب" value={stats.absent} icon={UserX} colorClass="text-red-600" />
          </div>

          <Card title="نظرة عامة" className="mb-6">
               <div className="h-64" dir="ltr">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Bar dataKey="value" fill="#26ac68" barSize={50} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
          </Card>
          
          <div className="fixed bottom-14 left-0 right-0 p-4 flex justify-center z-30 pointer-events-none">
             <Button onClick={handleExportCSV} variant="accent" className="pointer-events-auto shadow-lg">
                <Download className="w-4 h-4 inline ml-2" /> تحميل تقرير الحضور (CSV)
             </Button>
          </div>
        </>
      )}

      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <Card title="إضافة معلم">
            <Input label="الاسم" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} />
            <Input label="الكود" value={newTeacher.code} onChange={e => setNewTeacher({...newTeacher, code: e.target.value})} />
            <Input label="كلمة السر" type="password" value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} />
            <Input label="البريد" type="email" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} />
            <Button fullWidth onClick={handleAddTeacher}>إضافة</Button>
          </Card>
          <Card title="قائمة المعلمين">
             <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
               {Object.values(teachers).map(t => (
                 <div key={t.code} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                   <div>
                     <div className="font-bold text-secondary">{t.name}</div>
                     <div className="text-sm text-gray-500">كود: {t.code}</div>
                     <div className="text-xs text-gray-400">طلاب: {t.students?.length || 0}</div>
                   </div>
                   <Button className="p-2 h-10 w-10 flex items-center justify-center" variant="danger" onClick={() => handleDeleteTeacher(t.code)}><Trash2 className="w-4 h-4" /></Button>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      )}

      {activeTab === 'students' && (
        <Card title="الطلاب المسجلين">
            <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm text-center">
                لمشاهدة يوميات طالب، اضغط على زر "عرض اليوميات"
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
               {students.map(s => (
                 <div key={s.id} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                        <div className="font-bold text-secondary text-lg">{s.name}</div>
                        <div className="text-xs text-gray-500 mt-1">كود: {s.code || 'غير متوفر'}</div>
                     </div>
                     <Button className="p-2 h-8 w-8 flex items-center justify-center" variant="danger" onClick={() => handleDeleteStudent(s.id)}>
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
                   <Button fullWidth className="text-sm py-2 mt-2" variant="primary" onClick={() => {
                       if(s.code) {
                         const logs = api.getStudentLogs(s.code);
                         setSelectedStudentLogs({ student: s, logs });
                       } else {
                         alert('هذا الطالب لا يملك كود مسجل');
                       }
                     }}>
                       <Eye className="w-4 h-4 inline ml-1" /> عرض اليوميات
                   </Button>
                 </div>
               ))}
               {students.length === 0 && (
                 <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا يوجد طلاب مسجلين</p>
                 </div>
               )}
             </div>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card title="التقارير والنسخ">
          <div className="space-y-6">
            
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> تقارير يوميات الطلاب
                </h3>
                <p className="text-sm text-green-600 mb-4">
                    تحميل ملف إكسل (CSV) يحتوي على جميع يوميات الحفظ والمراجعة لجميع الطلاب.
                </p>
                <Button onClick={handleExportStudentLogsCSV} variant="primary" fullWidth>
                    <Download className="inline ml-2 w-4 h-4" /> تحميل يوميات الطلاب
                </Button>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5" /> النسخ الاحتياطي
                </h3>
                <p className="text-sm text-purple-600 mb-4">
                    حفظ نسخة كاملة من قاعدة البيانات (معلمين، طلاب، سجلات).
                </p>
                <Button onClick={handleBackup} variant="purple" fullWidth>
                    تحميل نسخة احتياطية (JSON)
                </Button>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-gray-700 font-bold mb-2">استعادة نسخة احتياطية</p>
              <input type="file" accept=".json" onChange={e => {
                const file = e.target.files?.[0];
                if(file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                       api.importData(JSON.parse(ev.target?.result as string));
                       alert('تمت الاستعادة بنجاح');
                       refreshData();
                    } catch(err) { alert('ملف غير صالح'); }
                  };
                  reader.readAsText(file);
                }
              }} className="w-full border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50" />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
         <Card title="إعدادات الإدارة">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-secondary" /> تغيير كلمة سر الإدارة
               </h3>
               <Input label="كلمة السر الحالية" type="password" value={pwdData.old} onChange={e => setPwdData({...pwdData, old: e.target.value})} />
               <Input label="كلمة السر الجديدة" type="password" value={pwdData.new} onChange={e => setPwdData({...pwdData, new: e.target.value})} />
               <Input label="تأكيد كلمة السر" type="password" value={pwdData.confirm} onChange={e => setPwdData({...pwdData, confirm: e.target.value})} />
               <Button onClick={handleChangePassword} variant="primary" fullWidth className="mt-2">حفظ التغييرات</Button>
            </div>
         </Card>
      )}

      {/* Student Logs Modal */}
      {selectedStudentLogs && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md max-h-[80vh] flex flex-col bg-white" title={`يوميات: ${selectedStudentLogs.student.name.split(' ').slice(0,2).join(' ')}`}>
             <div className="overflow-y-auto flex-1 custom-scrollbar p-1">
               {selectedStudentLogs.logs.length === 0 ? (
                 <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    لا توجد يوميات مسجلة
                 </div>
               ) : (
                 <div className="space-y-3">
                   {selectedStudentLogs.logs.slice().reverse().map((log, idx) => (
                     <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2 border-b pb-2">
                           <span className="font-bold text-primary text-sm flex items-center gap-1">
                               📅 {log.dateDisplay}
                           </span>
                        </div>
                        <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                               <span className="text-gray-500 text-xs">الحفظ:</span>
                               <span className="font-bold text-gray-800 text-left">{log.newMemorizing}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-gray-500 text-xs">المراجعة:</span>
                               <span className="font-bold text-gray-800 text-left">{log.review}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-gray-500 text-xs">التسميع:</span>
                               <span className="font-bold text-gray-800">{log.listening}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-gray-500 text-xs">الهدف:</span>
                               <span className="font-bold text-gray-800 text-left">{log.newTarget}</span>
                           </div>
                        </div>
                        {log.notes && (
                           <div className="mt-2 pt-2 border-t text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                             <span className="font-bold text-yellow-700">ملاحظات:</span> {log.notes}
                           </div>
                        )}
                     </div>
                   ))}
                 </div>
               )}
             </div>
             <div className="mt-4 pt-4 border-t">
               <Button fullWidth variant="secondary" onClick={() => setSelectedStudentLogs(null)}>إغلاق</Button>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
};