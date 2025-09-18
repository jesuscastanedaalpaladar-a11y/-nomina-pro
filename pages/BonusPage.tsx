
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Employee, BonusTemplate, BonusCalculationType, User, EmployeeStatus } from '../types';
import { getCurrentPayrollPeriod, formatCurrency } from '../utils/dateUtils';
import { Icon, Icons } from '../components/ui/Icon';

interface BonusPageProps {
    employees: Employee[];
    bonusTemplates: BonusTemplate[];
    onAssignBonuses: (assignments: { employeeId: number; amount: number }[], bonusTemplate: BonusTemplate) => void;
    simulatedDate: Date;
    currentUser: User;
    onAddBonusTemplate: (template: Omit<BonusTemplate, 'id'>) => void;
}

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    summary: { count: number; totalAmount: number; bonusName: string };
}> = ({ isOpen, onClose, onConfirm, title, summary }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 text-center" onClick={e => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <Icon icon={Icons.gift} className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mt-3">{title}</h3>
                <div className="mt-2 text-sm text-slate-500 space-y-2">
                    <p>Estás a punto de asignar el bono <strong className="text-slate-700">{summary.bonusName}</strong> a <strong className="text-slate-700">{summary.count}</strong> empleado(s).</p>
                    <p>El impacto total en la nómina será de <strong className="text-slate-700">{formatCurrency(summary.totalAmount)}</strong>.</p>
                    <p className="font-semibold pt-2">Esta acción no se puede deshacer. ¿Deseas continuar?</p>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
                        Cancelar
                    </button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">
                        Confirmar y Asignar
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateBonusModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: Omit<BonusTemplate, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [calculationType, setCalculationType] = useState<BonusCalculationType>(BonusCalculationType.Fixed);
    const [value, setValue] = useState(0);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setCalculationType(BonusCalculationType.Fixed);
            setValue(0);
            setDescription('');
        }
    }, [isOpen]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || value <= 0) {
            alert('Por favor, completa el nombre y un valor mayor a cero.');
            return;
        }
        onSave({
            name,
            calculation_type: calculationType,
            value,
            description,
        });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Crear Nuevo Tipo de Bono</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Cerrar modal"><Icon icon={Icons.x} className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="bonus-name" className="block text-sm font-medium text-slate-700">Nombre del Bono</label>
                        <input type="text" name="bonus-name" id="bonus-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="calculation_type" className="block text-sm font-medium text-slate-700">Tipo de Cálculo</label>
                            <select name="calculation_type" id="calculation_type" value={calculationType} onChange={e => setCalculationType(e.target.value as BonusCalculationType)} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md">
                                <option value={BonusCalculationType.Fixed}>Monto Fijo</option>
                                <option value={BonusCalculationType.Percentage}>Porcentaje de Salario</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="value" className="block text-sm font-medium text-slate-700">
                                {calculationType === BonusCalculationType.Fixed ? 'Monto (MXN)' : 'Porcentaje (%)'}
                            </label>
                            <input type="number" name="value" id="value" value={value} onChange={e => setValue(Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" required step="0.01" min="0"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción</label>
                        <textarea name="description" id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                    </div>
                    <div className="pt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">Crear Bono</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const BonusPage: React.FC<BonusPageProps> = ({ employees, bonusTemplates, onAssignBonuses, simulatedDate, currentUser, onAddBonusTemplate }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set());
    const [bonusAmounts, setBonusAmounts] = useState<Record<number, number>>({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const periodInfo = getCurrentPayrollPeriod(simulatedDate);
    
    const activeEmployees = useMemo(() => employees.filter(e => {
        if (e.status !== EmployeeStatus.Active) return false;
        if (currentUser.role === 'gerente_sucursal' && !currentUser.assigned_branch_ids?.includes(e.branch_id)) {
            return false;
        }
        return true;
    }), [employees, currentUser]);

    const selectedTemplate = useMemo(() => {
        if (!selectedTemplateId) return null;
        return bonusTemplates.find(t => t.id === selectedTemplateId) || null;
    }, [selectedTemplateId, bonusTemplates]);

    const calculateBonusAmount = useCallback((employee: Employee, template: BonusTemplate): number => {
        if (template.calculation_type === BonusCalculationType.Fixed) {
            return template.value;
        }
        if (template.calculation_type === BonusCalculationType.Percentage) {
            return (employee.gross_salary * template.value) / 100;
        }
        return 0;
    }, []);

    const handleTemplateChange = (templateId: number) => {
        setSelectedTemplateId(templateId);
        const template = bonusTemplates.find(t => t.id === templateId);
        if (template) {
            const newAmounts: Record<number, number> = {};
            activeEmployees.forEach(emp => {
                newAmounts[emp.id] = calculateBonusAmount(emp, template);
            });
            setBonusAmounts(newAmounts);
        }
        setSelectedEmployeeIds(new Set()); // Reset selection on template change
    };

    const handleSelectEmployee = (employeeId: number) => {
        setSelectedEmployeeIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeId)) {
                newSet.delete(employeeId);
            } else {
                newSet.add(employeeId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedEmployeeIds(new Set(activeEmployees.map(e => e.id)));
        } else {
            setSelectedEmployeeIds(new Set());
        }
    };

    const handleAmountChange = (employeeId: number, amount: string) => {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount)) {
            setBonusAmounts(prev => ({ ...prev, [employeeId]: numericAmount }));
        }
    };

    const handleAssignClick = () => {
        if (selectedEmployeeIds.size === 0 || !selectedTemplate) {
            alert('Por favor, selecciona un bono y al menos un empleado.');
            return;
        }
        setIsConfirmModalOpen(true);
    };
    
    const handleConfirmAssign = () => {
        if (!selectedTemplate) return;

        const assignments = Array.from(selectedEmployeeIds).map(id => ({
            employeeId: id,
            amount: bonusAmounts[id] || 0
        }));

        onAssignBonuses(assignments, selectedTemplate);
        
        // Reset state after assignment
        setIsConfirmModalOpen(false);
        setSelectedTemplateId(null);
        setSelectedEmployeeIds(new Set());
        setBonusAmounts({});
        alert('Bonos asignados exitosamente.');
    };
    
    const confirmationSummary = useMemo(() => {
        if (!selectedTemplate) return { count: 0, totalAmount: 0, bonusName: '' };
        
        const totalAmount = Array.from(selectedEmployeeIds).reduce((acc, id) => acc + (bonusAmounts[id] || 0), 0);
        return {
            count: selectedEmployeeIds.size,
            totalAmount,
            bonusName: selectedTemplate.name
        };
    }, [selectedEmployeeIds, bonusAmounts, selectedTemplate]);


    return (
        <>
            <div className="p-8 space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-800">Asignar Bonos</h1>
                    <p className="text-slate-500">
                        Asigna bonos a los empleados para el periodo de nómina actual: {periodInfo.range}.
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">1. Selecciona o crea un tipo de bono</h3>
                            <p className="text-sm text-slate-500">Elige una plantilla para empezar a asignar o crea una nueva.</p>
                        </div>
                        {currentUser.role === 'super_admin' && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex-shrink-0 flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                <Icon icon={Icons.plusCircle} className="w-5 h-5 mr-2" />
                                Crear Tipo de Bono
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="md:col-span-2">
                            <label htmlFor="bonus-template" className="block text-sm font-medium text-slate-700 sr-only">Selecciona un tipo de bono</label>
                            <select
                                id="bonus-template"
                                value={selectedTemplateId || ''}
                                onChange={(e) => handleTemplateChange(Number(e.target.value))}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                            >
                                <option value="" disabled>Selecciona una plantilla de bono...</option>
                                {bonusTemplates.map(template => (
                                    <option key={template.id} value={template.id}>{template.name}</option>
                                ))}
                            </select>
                            {selectedTemplate && <p className="mt-2 text-xs text-slate-500">{selectedTemplate.description}</p>}
                        </div>
                        <div>
                             <button
                                onClick={handleAssignClick}
                                disabled={!selectedTemplate || selectedEmployeeIds.size === 0}
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                <Icon icon={Icons.gift} className="w-5 h-5 mr-2" />
                                Asignar Bono a {selectedEmployeeIds.size} Empleado(s)
                            </button>
                        </div>
                    </div>
                </div>

                {selectedTemplate && (
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b">
                           <h3 className="text-lg font-semibold text-slate-800">2. Selecciona los empleados y ajusta los montos</h3>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="p-4 text-left">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                            onChange={handleSelectAll}
                                            checked={activeEmployees.length > 0 && selectedEmployeeIds.size === activeEmployees.length}
                                        />
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Puesto</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Monto del Bono</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {activeEmployees.map(employee => (
                                    <tr key={employee.id}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                checked={selectedEmployeeIds.has(employee.id)}
                                                onChange={() => handleSelectEmployee(employee.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full object-cover" src={employee.avatarUrl} alt={employee.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{employee.position}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative rounded-md shadow-sm">
                                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-slate-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={bonusAmounts[employee.id] || 0}
                                                    onChange={(e) => handleAmountChange(employee.id, e.target.value)}
                                                    className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-7 pr-4 sm:text-sm border-slate-300 rounded-md"
                                                    step="50"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmAssign}
                title="Confirmar Asignación de Bonos"
                summary={confirmationSummary}
            />
            <CreateBonusModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={onAddBonusTemplate}
            />
        </>
    );
};
