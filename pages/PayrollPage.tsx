
import React, { useState, useMemo, useEffect } from 'react';
import { Employee, User, Incident, EmployeeStatus } from '../types';
import { getCurrentPayrollPeriod, getCurrentPayrollPeriodIdentifier, formatCurrency } from '../utils/dateUtils';
import { Icon, Icons } from '../components/ui/Icon';
import { calculatePayroll, PayrollCalculationType } from '../utils/payrollUtils';

interface PayrollPageProps {
    employees: Employee[];
    currentUser: User;
    paymentStatus: Record<number, boolean>;
    onPayEmployee: (employeeId: number) => void;
    onSelectEmployee: (employeeId: number) => void;
    onClosePeriod: () => void;
    simulatedDate: Date;
    signedPayslips: Record<string, number[]>;
    incidents: Incident[];
}

const KpiCard: React.FC<{ title: string; value: string | number; children?: React.ReactNode }> = ({ title, value, children }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        {children}
    </div>
);

const EmployeeListItem: React.FC<{ employee: Employee; onSelect: () => void; isSelected: boolean; hasSigned: boolean; }> = ({ employee, onSelect, isSelected, hasSigned }) => (
    <button
        onClick={onSelect}
        className={`w-full text-left p-2 pr-3 my-1 rounded-lg flex items-center space-x-3 transition-all duration-150 ${
            isSelected ? 'bg-brand-100 ring-2 ring-brand-300' : 'hover:bg-slate-100'
        }`}
    >
        <div className={`w-1.5 h-10 rounded-full ${isSelected ? 'bg-brand-500' : 'bg-transparent'}`}></div>
        <img src={employee.avatarUrl} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 flex justify-between items-center">
            <div>
                <p className={`font-semibold text-sm ${isSelected ? 'text-brand-800' : 'text-slate-800'}`}>{employee.name}</p>
                <p className={`text-xs ${isSelected ? 'text-brand-600' : 'text-slate-500'}`}>{employee.position}</p>
            </div>
            {/* FIX: Replaced title prop on Icon with a wrapping span with a title attribute to fix type error. */}
            {hasSigned && <span title="Recibo Firmado"><Icon icon={Icons.checkCircle} className="w-5 h-5 text-green-500 flex-shrink-0" /></span>}
        </div>
    </button>
);

export const PayrollPage: React.FC<PayrollPageProps> = ({ employees, currentUser, paymentStatus, onPayEmployee, onSelectEmployee, onClosePeriod, simulatedDate, signedPayslips, incidents }) => {
    const [selectedPayrollEmployeeId, setSelectedPayrollEmployeeId] = useState<number | null>(null);

    const visibleEmployees = useMemo(() => {
        return employees.filter(e => {
            if (e.status !== EmployeeStatus.Active) return false;
            if (currentUser.role === 'gerente_sucursal' && !currentUser.assigned_branch_ids?.includes(e.branch_id)) {
                return false;
            }
            return true;
        });
    }, [employees, currentUser]);

    const pendingEmployees = useMemo(() => visibleEmployees.filter(e => !paymentStatus[e.id]), [visibleEmployees, paymentStatus]);
    const paidEmployees = useMemo(() => visibleEmployees.filter(e => paymentStatus[e.id]), [visibleEmployees, paymentStatus]);

    const selectedEmployee = useMemo(() => {
        if (!selectedPayrollEmployeeId) return null;
        return visibleEmployees.find(e => e.id === selectedPayrollEmployeeId);
    }, [selectedPayrollEmployeeId, visibleEmployees]);

    const calculation = useMemo((): PayrollCalculationType | null => {
        if (!selectedEmployee) return null;
        return calculatePayroll(selectedEmployee, incidents, simulatedDate);
    }, [selectedEmployee, incidents, simulatedDate]);

    useEffect(() => {
        if (selectedPayrollEmployeeId && !visibleEmployees.some(e => e.id === selectedPayrollEmployeeId)) {
             setSelectedPayrollEmployeeId(null);
        }
    }, [visibleEmployees, selectedPayrollEmployeeId]);
    
     useEffect(() => {
        if (selectedPayrollEmployeeId && paymentStatus[selectedPayrollEmployeeId]) {
            const nextEmployee = pendingEmployees.length > 0 ? pendingEmployees[0] : null;
            setSelectedPayrollEmployeeId(nextEmployee ? nextEmployee.id : null);
        } else if (!selectedPayrollEmployeeId && pendingEmployees.length > 0) {
            setSelectedPayrollEmployeeId(pendingEmployees[0].id);
        }
    }, [paymentStatus, pendingEmployees, selectedPayrollEmployeeId]);

    const handlePay = () => {
        if (selectedEmployee) {
            onPayEmployee(selectedEmployee.id);
        }
    };

    const totalCount = visibleEmployees.length;
    const paidCount = paidEmployees.length;
    const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
    const periodInfo = getCurrentPayrollPeriod(simulatedDate);
    const periodIdentifier = getCurrentPayrollPeriodIdentifier(simulatedDate);
    const isPayrollComplete = totalCount > 0 && pendingEmployees.length === 0;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 h-full flex flex-col bg-slate-50">
            {/* Header and Progress */}
            <div className="flex-shrink-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    Procesar Nómina: <span className="text-brand-600">{periodInfo.range}</span>
                </h2>
                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <KpiCard title="Pendientes de Pago" value={pendingEmployees.length} />
                    <KpiCard title="Pagados" value={paidCount} />
                    <KpiCard title="Progreso Total" value={`${progress.toFixed(0)}%`}>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </KpiCard>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Employee Lists */}
                <div className="w-full lg:w-1/3 lg:max-w-xs xl:max-w-sm bg-white p-2 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0">
                   <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-lg font-semibold text-slate-800 px-2 pb-2">Pendientes</h3>
                        <div className="py-2 -ml-2 pr-1 overflow-y-auto">
                            {pendingEmployees.map(emp => (
                                <EmployeeListItem 
                                    key={emp.id} 
                                    employee={emp} 
                                    onSelect={() => setSelectedPayrollEmployeeId(emp.id)} 
                                    isSelected={selectedPayrollEmployeeId === emp.id} 
                                    hasSigned={signedPayslips[periodIdentifier]?.includes(emp.id) ?? false}
                                />
                            ))}
                             {pendingEmployees.length === 0 && !isPayrollComplete && (
                                <p className="px-3 text-sm text-slate-500">No hay empleados pendientes.</p>
                            )}
                        </div>
                   </div>
                   <div className="flex-1 flex flex-col min-h-0 border-t mt-4 pt-4">
                        <h3 className="text-lg font-semibold text-slate-800 px-2 pb-2">Pagados</h3>
                        <div className="py-2 overflow-y-auto">
                             {paidEmployees.map(emp => {
                                const hasSigned = signedPayslips[periodIdentifier]?.includes(emp.id) ?? false;
                                return (
                                <div key={emp.id} className="w-full text-left p-3 rounded-lg flex items-center space-x-3 opacity-80">
                                    <Icon icon={Icons.checkCircle} className="w-6 h-6 text-green-500 flex-shrink-0" />
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                                    <div className="flex-1 flex justify-between items-center">
                                        <p className="font-medium text-sm text-slate-600 line-through">{emp.name}</p>
                                        {/* FIX: Replaced title prop on Icon with a wrapping span with a title attribute to fix type error. */}
                                        {hasSigned && <span title="Recibo Firmado"><Icon icon={Icons.checkCircle} className="w-5 h-5 text-green-500 flex-shrink-0" /></span>}
                                    </div>
                                </div>
                             )})}
                        </div>
                   </div>
                </div>

                {/* Payroll Detail */}
                <div className="flex-1 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
                    {selectedEmployee && calculation ? (
                        <div className="flex flex-col h-full">
                            <div className="flex-shrink-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                         <img src={selectedEmployee.avatarUrl} alt={selectedEmployee.name} className="w-16 h-16 rounded-full object-cover" />
                                         <div>
                                            <h3 className="text-2xl font-bold text-slate-800">{selectedEmployee.name}</h3>
                                            <p className="text-md text-slate-600">{selectedEmployee.position}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => onSelectEmployee(selectedEmployee.id)} className="text-sm font-semibold text-brand-600 hover:text-brand-800 hover:underline whitespace-nowrap">Ver Expediente</button>
                                </div>
                            </div>
                            
                            <div className="flex-1 mt-6 space-y-4">
                                <dl className="space-y-3 p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex justify-between text-base"><dt className="text-slate-600">Salario Bruto (Quincenal)</dt><dd className="font-medium text-slate-900">{formatCurrency(calculation.totalEarnings)}</dd></div>
                                    <div className="flex justify-between text-base"><dt className="text-slate-600">Total Deducciones</dt><dd className="font-medium text-red-600">-{formatCurrency(calculation.totalDeductions)}</dd></div>
                                </dl>
                            </div>
                            
                            <div className="flex-shrink-0 mt-6 pt-6 border-t-2 border-dashed">
                                <div className="bg-brand-50 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="text-lg font-bold text-brand-800">Neto a Pagar</h4>
                                        <p className="text-4xl font-extrabold text-brand-700">{formatCurrency(calculation.netPay)}</p>
                                    </div>
                                    <button 
                                        onClick={handlePay}
                                        className="flex items-center gap-2 px-6 py-4 font-semibold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105 transition-transform duration-150">
                                        <Icon icon={Icons.checkCircle} className="w-6 h-6" />
                                        Pagar y Continuar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                            <Icon icon={Icons.checkCircle} className="w-24 h-24 text-green-300" />
                            <h3 className="mt-4 text-xl font-bold text-slate-800">
                                {isPayrollComplete ? '¡Nómina completada!' : 'No hay empleados para procesar'}
                            </h3>
                            <p className="mt-1 max-w-sm mx-auto">
                                 {isPayrollComplete ? '¡Felicidades! Has procesado el pago de todos los empleados para este periodo.' : 'Agrega un empleado activo para poder procesar la nómina.'}
                            </p>
                             {isPayrollComplete && (
                                <div className="mt-6">
                                    <button
                                        onClick={onClosePeriod}
                                        className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-brand-600 rounded-lg shadow-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                                    >
                                        Cerrar Periodo y Avanzar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};