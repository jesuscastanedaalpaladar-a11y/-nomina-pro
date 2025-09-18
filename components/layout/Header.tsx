
import React, { useState, useRef, useEffect } from 'react';
import { Icon, Icons } from '../ui/Icon';
import { User, Role } from '../../types';
import { MOCK_USERS } from '../../constants';

interface HeaderProps {
    title: string;
    currentUser: User;
    onSwitchUser: (user: User) => void;
}

const getRoleDisplayName = (role: Role) => {
    switch (role) {
        case 'super_admin': return 'Super Admin';
        case 'gerente_sucursal': return 'Gerente de Sucursal';
        case 'empleado': return 'Empleado';
        default: return 'Usuario';
    }
}

export const Header: React.FC<HeaderProps> = ({ title, currentUser, onSwitchUser }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleActionClick = (action: string) => {
        alert(`${action} (simulación)`);
        setIsDropdownOpen(false);
    };
    
    const handleSwitchUser = (userKey: 'admin' | 'manager' | 'employee') => {
        onSwitchUser(MOCK_USERS[userKey]);
        setIsDropdownOpen(false);
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <img
                        className="h-9 w-9 rounded-full object-cover"
                        src={currentUser.avatarUrl}
                        alt="User avatar"
                    />
                    <div className="ml-3 text-left">
                        <p className="text-sm font-medium text-slate-700">{currentUser.name}</p>
                        <p className="text-xs text-slate-500">{getRoleDisplayName(currentUser.role)}</p>
                    </div>
                     <Icon icon={Icons.chevronDown} className={`w-4 h-4 ml-2 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-slate-200 z-10">
                        <button
                            onClick={() => handleActionClick('Ver mi perfil')}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                           <Icon icon={Icons.userCircle} className="w-5 h-5 mr-3 text-slate-500"/> Mi Perfil
                        </button>
                        <button
                            onClick={() => handleActionClick('Cerrando sesión')}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                           <Icon icon={Icons.logout} className="w-5 h-5 mr-3 text-slate-500"/> Cerrar Sesión
                        </button>
                        <div className="border-t border-slate-200 my-1"></div>
                        <div className="px-4 py-2 text-xs text-slate-400">Cambiar Rol (Simulación)</div>
                        <button
                            onClick={() => handleSwitchUser('admin')}
                            disabled={currentUser.role === 'super_admin'}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Icon icon={Icons.userCircle} className="w-5 h-5 mr-3 text-slate-500"/> Ver como Admin
                        </button>
                        <button
                            onClick={() => handleSwitchUser('manager')}
                            disabled={currentUser.role === 'gerente_sucursal'}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Icon icon={Icons.users} className="w-5 h-5 mr-3 text-slate-500"/> Ver como Gerente
                        </button>
                         <button
                            onClick={() => handleSwitchUser('employee')}
                            disabled={currentUser.role === 'empleado'}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Icon icon={Icons.userCircle} className="w-5 h-5 mr-3 text-slate-500"/> Ver como Empleado
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};