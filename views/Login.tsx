import React, { useState } from 'react';
import { ViewState, UserSession } from '../types';
import { Button, Card, Input } from '../components/UI';
import { api } from '../services/api';

interface LoginProps {
  view: ViewState;
  onNavigate: (view: ViewState) => void;
  onLoginSuccess: (type: UserSession['type'], data?: any) => void;
}

export const Login: React.FC<LoginProps> = ({ view, onNavigate, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAdminLogin = () => {
    const adminPwd = api.getAdminPassword();
    if (formData.password === adminPwd) {
      onLoginSuccess('admin');
    } else {
      setError('كلمة السر غير صحيحة');
    }
  };

  const handleTeacherLogin = () => {
    const teachers = api.getTeachers();
    const teacher = teachers[formData.code];
    if (teacher && teacher.password === formData.password) {
      onLoginSuccess('teacher', teacher);
    } else {
      setError('الكود أو كلمة السر خطأ');
    }
  };

  const handleStudentLogin = () => {
    const students = api.getStudents();
    const student = students.find(s => s.code === formData.code && s.password === formData.password);
    if (student) {
      onLoginSuccess('student', student);
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  const handleStudentRegister = () => {
    if (!formData.name || !formData.code || !formData.password) return setError('أكمل البيانات');
    if (formData.password !== formData.confirmPassword) return setError('كلمات السر غير متطابقة');
    
    const students = api.getStudents();
    if (students.some(s => s.code === formData.code)) return setError('الكود مستخدم من قبل');

    api.registerStudent({
      id: Date.now().toString(),
      name: formData.name,
      code: formData.code,
      password: formData.password,
      class: 'جديد',
      registrationDate: new Date().toISOString()
    });

    setSuccess('تم التسجيل بنجاح! جاري التحويل...');
    setTimeout(() => onNavigate('LOGIN_STUDENT'), 1500);
  };

  const titles = {
    'LOGIN_ADMIN': 'دخول الإدارة',
    'LOGIN_TEACHER': 'دخول المعلم',
    'LOGIN_STUDENT': 'دخول الطالب',
    'REGISTER_STUDENT': 'تسجيل طالب جديد'
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md animate-fade-in-up">
        <h2 className="text-2xl font-bold text-center text-secondary mb-6">{titles[view]}</h2>
        
        {view === 'REGISTER_STUDENT' && (
          <Input 
            label="اسم الطالب" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="الاسم الثلاثي"
          />
        )}

        {(view !== 'LOGIN_ADMIN') && (
          <Input 
            label={view === 'REGISTER_STUDENT' ? 'اختر كود للدخول' : 'كود الدخول'} 
            name="code" 
            value={formData.code} 
            onChange={handleChange} 
          />
        )}

        <Input 
          label="كلمة السر" 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
        />

        {view === 'REGISTER_STUDENT' && (
          <Input 
            label="تأكيد كلمة السر" 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
          />
        )}

        {error && <div className="text-red-500 text-center mb-4 text-sm font-bold">{error}</div>}
        {success && <div className="text-green-500 text-center mb-4 text-sm font-bold">{success}</div>}

        <div className="mt-6 space-y-3">
          {view === 'LOGIN_ADMIN' && <Button fullWidth onClick={handleAdminLogin}>دخول</Button>}
          {view === 'LOGIN_TEACHER' && <Button fullWidth onClick={handleTeacherLogin}>دخول</Button>}
          {view === 'LOGIN_STUDENT' && <Button fullWidth onClick={handleStudentLogin}>دخول</Button>}
          {view === 'REGISTER_STUDENT' && <Button fullWidth onClick={handleStudentRegister}>تسجيل</Button>}
          
          <Button fullWidth variant="secondary" onClick={() => onNavigate('HOME')}>رجوع للقائمة الرئيسية</Button>
          
          {view === 'LOGIN_STUDENT' && (
            <div className="text-center mt-2">
              <button className="text-primary text-sm underline" onClick={() => onNavigate('REGISTER_STUDENT')}>
                ليس لدي حساب؟ تسجيل جديد
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};