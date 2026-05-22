import { useState, useEffect, FormEvent } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';
import { User, TabType } from '../types';
import { UserPlus, Shield, Mail, Trash2, Edit2, Check, X, Clock, Activity, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

const ALL_TABS: TabType[] = [
  'overview', 'monitor', 'registry', 'floormap', 'configuration', 
  'explorer', 'alerts', 
  'integrations', 'security', 'admin', 'settings'
];

export default function Admin() {
  const { language } = useSettings();
  const t = useTranslation(language);

  const defaultUsers: User[] = [
    { 
      id: '1', 
      name: 'A. Kamau', 
      username: 'a.kamau',
      password: 'admin123',
      role: 'Super Admin', 
      email: 'a.kamau@ishmatek.com',
      permissions: [...ALL_TABS],
      status: 'Active',
      lastLogin: '2 mins ago'
    },
    { 
      id: '2', 
      name: 'J. Uwimana', 
      username: 'j.uwimana',
      password: 'tech123',
      role: 'Technician', 
      email: 'j.uwimana@ishmatek.com',
      permissions: ['overview', 'monitor', 'registry', 'floormap'],
      status: 'Active',
      lastLogin: '1 hour ago'
    },
    { 
      id: '3', 
      name: 'M. Nzabonimpa', 
      username: 'm.nzabonimpa',
      password: 'oper123',
      role: 'Operator', 
      email: 'm.nzabonimpa@ishmatek.com',
      permissions: ['overview', 'monitor', 'alerts'],
      status: 'Inactive',
      lastLogin: '2 days ago'
    },
    { 
      id: '4', 
      name: 'S. Ishimwe', 
      username: 's.ishimwe',
      password: 'admin123',
      role: 'Admin', 
      email: 's.ishimwe@ishmatek.com',
      permissions: ['overview', 'monitor', 'admin', 'settings'],
      status: 'Active',
      lastLogin: 'Just now'
    },
  ];

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nexus_admin_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  useEffect(() => {
    localStorage.setItem('nexus_admin_users', JSON.stringify(users));
  }, [users]);

  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'User' as User['role'],
    email: '',
    status: 'Active' as User['status'],
  });
  const [showFormPassword, setShowFormPassword] = useState(false);

  const togglePermission = (userId: string, tab: TabType) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const hasPerm = user.permissions.includes(tab);
        return {
          ...user,
          permissions: hasPerm 
            ? user.permissions.filter(p => p !== tab) 
            : [...user.permissions, tab]
        };
      }
      return user;
    }));
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', username: '', password: '', role: 'User', email: '', status: 'Active' });
    setShowFormPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUserId(user.id);
    setFormData({ name: user.name, username: user.username, password: user.password, role: user.role, email: user.email, status: user.status });
    setShowFormPassword(false);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setIsDeleteModalOpen(false);
    setSelectedUserId(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        email: formData.email,
        status: formData.status,
        lastLogin: 'Never',
        permissions: ['overview']
      };
      setUsers(prev => [...prev, newUser]);
    } else if (selectedUserId) {
      setUsers(prev => prev.map(u => u.id === selectedUserId ? { ...u, ...formData } : u));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-500 overflow-y-auto h-full relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1">{t('userManagement')}</h1>
          <p className="text-sm text-text-dim">Super Admin control center for roles and access auditing.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-nexus-blue text-white rounded-lg text-xs font-bold hover:bg-nexus-blue/90 transition-colors shadow-lg shadow-nexus-blue/20"
        >
          <UserPlus size={16} />
          {t('addUser')}
        </button>
      </div>

      <div className="bg-bg-1 border border-border-main rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-2 border-b border-border-main">
                <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('name')}</th>
                <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('role')}</th>
                <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('status')}</th>
                <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('lastLogin')}</th>
                <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('permissions')}</th>
                <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-bg-2/30 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-nexus-blue/10 flex items-center justify-center text-nexus-blue text-xs font-bold ring-1 ring-nexus-blue/20 shrink-0">
                        {user.name.split(' ').map(n => n?.[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-text-main group-hover:text-nexus-blue transition-colors truncate">{user.name}</div>
                        <div className="text-[10px] text-text-dim flex items-center gap-1">
                          <Mail size={10} className="shrink-0" />
                          <span className="truncate max-w-[120px]">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap",
                      user.role === 'Super Admin' ? "bg-nexus-purple/10 text-nexus-purple border-nexus-purple/20" : 
                      user.role === 'Admin' ? "bg-nexus-red/10 text-nexus-red border-nexus-red/20" :
                      user.role === 'Technician' ? "bg-nexus-amber/10 text-nexus-amber border-nexus-amber/20" : 
                      user.role === 'Operator' ? "bg-nexus-blue/10 text-nexus-blue border-nexus-blue/20" :
                      "bg-bg-3 text-text-dim border-border-main"
                    )}>
                      {t(user.role.toLowerCase().replace(' ', '')) || user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full animate-pulse",
                         user.status === 'Active' ? "bg-nexus-teal" : user.status === 'Inactive' ? "bg-text-muted" : "bg-nexus-amber"
                       )} />
                       <span className="text-[11px] text-text-dim font-medium">{t(user.status.toLowerCase())}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Clock size={12} />
                      <span className="text-[11px] font-mono">{user.lastLogin || 'Never'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-sm">
                      {editingPermissions === user.id ? (
                        <div className="fixed inset-0 z-40" onClick={() => setEditingPermissions(null)} />
                      ) : null}
                      {editingPermissions === user.id ? (
                        <div className="absolute z-50 grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-bg-1 border border-border-main rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 w-[max-content] max-w-[400px]">
                          {ALL_TABS.map(tab => (
                            <button
                              key={tab}
                              onClick={(e) => { e.stopPropagation(); togglePermission(user.id, tab); }}
                              className={cn(
                                "text-[9px] px-1.5 py-1 rounded border transition-all truncate",
                                user.permissions.includes(tab)
                                  ? "bg-nexus-blue text-white border-nexus-blue shadow-sm shadow-nexus-blue/30"
                                  : "bg-bg-2 text-text-dim border-border-main hover:border-nexus-blue/50"
                              )}
                            >
                              {t(tab)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        user.permissions.slice(0, 3).map(perm => (
                          <span key={perm} className="text-[9px] bg-bg-3 border border-border-main px-1.5 py-0.5 rounded text-text-dim whitespace-nowrap">
                            {t(perm)}
                          </span>
                        ))
                      )}
                      {user.permissions.length > 3 && editingPermissions !== user.id && (
                        <span className="text-[9px] bg-bg-3 border border-border-main px-1.5 py-0.5 rounded text-text-muted shrink-0">
                          +{user.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                       {editingPermissions === user.id ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingPermissions(null); }}
                            className="p-1.5 rounded-lg bg-nexus-teal/10 text-nexus-teal border border-nexus-teal/20 hover:bg-nexus-teal/20 transition-colors"
                            title="Done"
                          >
                            <Check size={14} />
                          </button>
                       ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingPermissions(user.id); }}
                            className="p-1.5 rounded-lg bg-nexus-blue/10 text-nexus-blue border border-nexus-blue/20 hover:bg-nexus-blue/20 transition-colors"
                            title="Edit Permissions"
                          >
                            <Shield size={14} />
                          </button>
                       )}
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleOpenEditModal(user); }}
                         className="p-1.5 rounded-lg bg-bg-3 text-text-dim border border-border-accent hover:border-nexus-blue hover:text-nexus-blue transition-colors"
                       >
                          <Edit2 size={14} />
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSelectedUserId(user.id); setIsDeleteModalOpen(true); }}
                         className="p-1.5 rounded-lg bg-nexus-red/10 text-nexus-red border border-nexus-red/20 hover:bg-nexus-red/20 transition-colors"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-bg-1 border border-border-main rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
              <h2 className="text-lg font-bold">{modalMode === 'add' ? t('addUser') : t('editUser')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-main transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('name')}</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm focus:border-nexus-blue outline-none transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('email')}</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm focus:border-nexus-blue outline-none transition-colors"
                  placeholder="name@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('username')}</label>
                <input 
                  required
                  type="text" 
                  value={formData.username}
                  onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                  className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm focus:border-nexus-blue outline-none transition-colors"
                  placeholder="e.g. john.doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('password')}</label>
                <div className="relative">
                  <input 
                    required
                    type={showFormPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm focus:border-nexus-blue outline-none transition-colors pr-10"
                    placeholder="Set login password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                  >
                    {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('role')}</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData(f => ({ ...f, role: e.target.value as User['role'] }))}
                    className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm focus:border-nexus-blue outline-none transition-colors appearance-none"
                  >
                    <option value="User">User</option>
                    <option value="Operator">Operator</option>
                    <option value="Technician">Technician</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('status')}</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData(f => ({ ...f, status: e.target.value as User['status'] }))}
                    className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm focus:border-nexus-blue outline-none transition-colors appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-bold border border-border-accent rounded-lg hover:bg-bg-2 transition-colors uppercase tracking-widest text-[10px]"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-bold bg-nexus-blue text-white rounded-lg hover:bg-nexus-blue/90 transition-colors shadow-lg shadow-nexus-blue/20 uppercase tracking-widest text-[10px]"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-bg-1 border border-border-main rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
                <div className="w-12 h-12 bg-nexus-red/10 text-nexus-red rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trash2 size={24} />
                </div>
                <h2 className="text-lg font-bold mb-2">{t('confirmDelete')}</h2>
                <p className="text-sm text-text-dim mb-6">{t('reallyDelete')}</p>
                <div className="flex gap-3">
                   <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="flex-1 px-4 py-2 text-sm font-bold border border-border-accent rounded-lg hover:bg-bg-2 transition-colors uppercase tracking-widest text-[10px]"
                   >
                      {t('cancel')}
                   </button>
                   <button 
                      onClick={() => selectedUserId && handleDeleteUser(selectedUserId)}
                      className="flex-1 px-4 py-2 text-sm font-bold bg-nexus-red text-white rounded-lg hover:bg-nexus-red/90 transition-colors uppercase tracking-widest text-[10px]"
                   >
                      {t('deleteUser')}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
