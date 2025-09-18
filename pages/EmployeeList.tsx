
import React, { useState, useMemo, useEffect } from 'react';
import { Employee, EmployeeStatus, User, Incident } from '../types';
import { MOCK_BRANCHES } from '../constants';
import { Icon, Icons } from '../components/ui/Icon';
import { formatCurrency, formatDate } from '../utils/dateUtils';

interface EmployeeListProps {
    employees: Employee[];
    onSelectEmployee: (id: number) => void;
    currentUser: User;
    onAddEmployee: (newEmployeeData: Omit<Employee, 'id'>) => void;
    onArchiveEmployee: (employeeId: number) => void;
    incidents: Incident[];
}

const EmployeeCard: React.FC<{ employee: Employee; onSelect: () => void; incidentsCount: number; onArchive: (employee: Employee) => void; canArchive: boolean; }> = ({ employee, onSelect, incidentsCount, onArchive, canArchive }) => {
    const branch = MOCK_BRANCHES.find(b => b.id === employee.branch_id);
    return (
        <div className="relative">
            <button
                onClick={onSelect}
                className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between text-left hover:shadow-lg hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-150 w-full h-full"
                aria-label={`Ver perfil de ${employee.name}`}
            >
                <div className="flex items-center space-x-4">
                    <img src={employee.avatarUrl} alt={employee.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors">{employee.name}</h3>
                        <p className="text-sm text-slate-500">{employee.position}</p>
                        <p className="text-xs text-slate-400">{branch?.name}</p>
                    </div>
                </div>
                <div className="mt-4 flex justify-start items-center">
                     <div className="flex items-center space-x-2">
                        {incidentsCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {incidentsCount} Incidencia(s)
                            </span>
                        )}
                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${employee.status === EmployeeStatus.Active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                            {employee.status}
                        </span>
                     </div>
                </div>
            </button>
             {canArchive && employee.status === EmployeeStatus.Active && (
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={(e) => { e.stopPropagation(); onArchive(employee); }}
                        className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                        aria-label={`Archivar a ${employee.name}`}
                        title="Archivar Empleado"
                    >
                        <Icon icon={Icons.archiveBox} className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

const AddEmployeeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (newEmployeeData: Omit<Employee, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        position: '',
        branch_id: 1,
        gross_salary: 20000,
        hire_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (isOpen) {
             setFormData({
                name: '',
                email: '',
                position: '',
                branch_id: 1,
                gross_salary: 20000,
                hire_date: new Date().toISOString().split('T')[0],
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEmployeeData: Omit<Employee, 'id'> = {
            ...formData,
            gross_salary: Number(formData.gross_salary),
            daily_salary: Number(formData.gross_salary) / 30,
            branch_id: Number(formData.branch_id),
            external_id: `EMP-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
            status: EmployeeStatus.Active,
            rfc: 'PENDIENTE',
            curp: 'PENDIENTE',
            nss: 'PENDIENTE',
            clabe: 'PENDIENTE',
            rank: 'Analista',
            avatarUrl: `https://picsum.photos/seed/${formData.name.split(' ')[0]}/200`
        };
        onSave(newEmployeeData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Agregar Nuevo Empleado</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Cerrar modal"><Icon icon={Icons.x} className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="position" className="block text-sm font-medium text-slate-700">Puesto</label>
                            <input type="text" name="position" id="position" value={formData.position} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="gross_salary" className="block text-sm font-medium text-slate-700">Salario Bruto Mensual</label>
                            <input type="number" name="gross_salary" id="gross_salary" value={formData.gross_salary} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="branch_id" className="block text-sm font-medium text-slate-700">Sucursal</label>
                            <select name="branch_id" id="branch_id" value={formData.branch_id} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md">
                                {MOCK_BRANCHES.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="hire_date" className="block text-sm font-medium text-slate-700">Fecha de Ingreso</label>
                            <input type="date" name="hire_date" id="hire_date" value={formData.hire_date} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" required />
                        </div>
                    </div>
                    <div className="pt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">Agregar Empleado</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 text-center" onClick={e => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <Icon icon={Icons.exclamationTriangle} className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mt-3">{title}</h3>
                <div className="mt-2 text-sm text-slate-500">
                    {children}
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
                        Cancelar
                    </button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">
                        Confirmar Archivar
                    </button>
                </div>
            </div>
        </div>
    );
};


export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSelectEmployee, currentUser, onAddEmployee, onArchiveEmployee, incidents }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [employeeToArchive, setEmployeeToArchive] = useState<Employee | null>(null);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            // RLS filter
            if (currentUser.role === 'gerente_sucursal' && !currentUser.assigned_branch_ids?.includes(employee.branch_id)) {
                return false;
            }

            // Existing filters
            const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  employee.position.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, currentUser, employees]);
    
    const getIncidentsCount = (employeeId: number) => {
        return incidents.filter(i => i.employee_id === employeeId).length;
    }
    
    const handleConfirmArchive = () => {
        if (employeeToArchive) {
            onArchiveEmployee(employeeToArchive.id);
            setEmployeeToArchive(null);
        }
    };

    return (
        <>
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center gap-4">
                    <div className="relative w-full max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon icon={Icons.search} className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o puesto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as EmployeeStatus | 'all')}
                            className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500"
                        >
                            <option value="all">Todos los estados</option>
                            <option value={EmployeeStatus.Active}>Activo</option>
                            <option value={EmployeeStatus.Archived}>Archivado</option>
                        </select>
                        <div className="flex items-center bg-slate-200 rounded-lg p-1">
                            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md ${viewMode === 'card' ? 'bg-white shadow' : 'text-slate-500'}`}><Icon icon={Icons.viewGrid} className="w-5 h-5"/></button>
                            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white shadow' : 'text-slate-500'}`}><Icon icon={Icons.viewList} className="w-5 h-5"/></button>
                        </div>
                         {currentUser.role === 'super_admin' && (
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 whitespace-nowrap">
                                <Icon icon={Icons.userPlus} className="w-5 h-5 mr-2" />
                                Agregar Empleado
                            </button>
                        )}
                    </div>
                </div>

                {viewMode === 'card' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEmployees.map(employee => (
                            <EmployeeCard 
                                key={employee.id} 
                                employee={employee} 
                                onSelect={() => onSelectEmployee(employee.id)} 
                                incidentsCount={getIncidentsCount(employee.id)}
                                onArchive={setEmployeeToArchive}
                                canArchive={currentUser.role === 'super_admin'}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Puesto</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sucursal</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salario Bruto</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estatus</th>
                                    {currentUser.role === 'super_admin' && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredEmployees.map(employee => (
                                    <tr 
                                        key={employee.id} 
                                        className="hover:bg-slate-100 cursor-pointer transition-colors"
                                        onClick={() => onSelectEmployee(employee.id)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectEmployee(employee.id); }}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Ver perfil de ${employee.name}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full object-cover" src={employee.avatarUrl} alt={employee.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                                                    <div className="text-sm text-slate-500">{employee.external_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{employee.position}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{MOCK_BRANCHES.find(b => b.id === employee.branch_id)?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatCurrency(employee.gross_salary)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === EmployeeStatus.Active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>{employee.status}</span>
                                        </td>
                                        {currentUser.role === 'super_admin' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {employee.status === EmployeeStatus.Active && (
                                                     <button
                                                        onClick={(e) => { e.stopPropagation(); setEmployeeToArchive(employee); }}
                                                        className="text-brand-600 hover:text-brand-900"
                                                    >
                                                        Archivar
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {filteredEmployees.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-slate-500">No se encontraron empleados que coincidan con la búsqueda o los filtros.</p>
                        {currentUser.role === 'gerente_sucursal' && <p className="text-sm text-slate-400 mt-2">Estás viendo solo empleados de tus sucursales asignadas.</p>}
                    </div>
                )}
            </div>
            <AddEmployeeModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={onAddEmployee}
            />
             <ConfirmationModal
                isOpen={!!employeeToArchive}
                onClose={() => setEmployeeToArchive(null)}
                onConfirm={handleConfirmArchive}
                title="Archivar Empleado"
            >
                <p>¿Estás seguro de que quieres archivar a <strong>{employeeToArchive?.name}</strong>? Su estado cambiará a "Archivado" y ya no será considerado en procesos de nómina activos.</p>
            </ConfirmationModal>
        </>
    );
};