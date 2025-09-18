
import React from 'react';
import { Icon, Icons } from '../ui/Icon';
import { Page } from '../../App';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    isNavDisabled?: boolean;
}

const NavItem: React.FC<{
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isDisabled: boolean;
}> = ({ icon, label, isActive, onClick, isDisabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 rounded-lg ${
                isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Icon icon={icon} className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </button>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isNavDisabled = false }) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
            <div className="h-16 flex items-center justify-center border-b border-slate-200">
                <h1 className="text-xl font-bold text-brand-700">Nomina Pro</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {isNavDisabled ? (
                    <NavItem
                        icon={Icons.userCircle}
                        label="Mi Perfil"
                        isActive={true}
                        onClick={() => {}}
                        isDisabled={false}
                    />
                ) : (
                    <>
                        <NavItem
                            icon={Icons.dashboard}
                            label="Panel General"
                            isActive={currentPage === 'dashboard'}
                            onClick={() => onNavigate('dashboard')}
                            isDisabled={false}
                        />
                        <NavItem
                            icon={Icons.users}
                            label={"Empleados"}
                            isActive={currentPage === 'employees'}
                            onClick={() => onNavigate('employees')}
                            isDisabled={false}
                        />
                        <NavItem
                            icon={Icons.cash}
                            label="Nómina"
                            isActive={currentPage === 'payroll'}
                            onClick={() => onNavigate('payroll')}
                            isDisabled={false}
                        />
                        <NavItem
                            icon={Icons.gift}
                            label="Bonos"
                            isActive={currentPage === 'bonuses'}
                            onClick={() => onNavigate('bonuses')}
                            isDisabled={false}
                        />
                        <NavItem
                            icon={Icons.clock}
                            label="Asistencia"
                            isActive={currentPage === 'attendance'}
                            onClick={() => onNavigate('attendance')}
                            isDisabled={false}
                        />
                        <NavItem
                            icon={Icons.reports}
                            label="Reportes"
                            isActive={currentPage === 'reports'}
                            onClick={() => onNavigate('reports')}
                            isDisabled={false}
                        />
                        <NavItem
                            icon={Icons.settings}
                            label="Configuración"
                            isActive={currentPage === 'settings'}
                            onClick={() => onNavigate('settings')}
                            isDisabled={true}
                        />
                    </>
                )}
            </nav>
        </aside>
    );
};
