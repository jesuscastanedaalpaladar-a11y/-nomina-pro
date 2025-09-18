
import React, { useMemo, useState } from 'react';
import { Employee, EmployeeStatus, AttendanceLog } from '../types';
import { toIsoDateString } from '../utils/dateUtils';
import { Icon, Icons } from '../components/ui/Icon';

interface AttendancePageProps {
    employees: Employee[];
    attendanceLog: AttendanceLog;
    simulatedDate: Date;
}

const formatTime = (date: Date | null) => {
    if (!date) return '—';
    return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const ReportStatCard: React.FC<{ icon: React.ComponentType<any>, title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('800', '100')}`}>
            <Icon icon={icon} className={`w-6 h-6 ${color}`} />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const MonthlyAttendanceReport: React.FC<{
    employee: Employee;
    monthData: {
        date: string;
        dayName: string;
        clockIn: Date | null;
        clockOut: Date | null;
        hoursWorked: number;
        status: 'Asistencia' | 'Falta' | 'Incompleto' | 'Fin de Semana';
    }[];
}> = ({ employee, monthData }) => {

    const summary = useMemo(() => {
        const workedDays = monthData.filter(d => d.status === 'Asistencia' || d.status === 'Incompleto').length;
        const absences = monthData.filter(d => d.status === 'Falta').length;
        const totalHours = monthData.reduce((acc, day) => acc + day.hoursWorked, 0);
        return { workedDays, absences, totalHours };
    }, [monthData]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Reporte para: <span className="text-brand-600">{employee.name}</span></h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ReportStatCard icon={Icons.checkCircle} title="Días Trabajados" value={`${summary.workedDays}`} color="text-green-800" />
                <ReportStatCard icon={Icons.x} title="Faltas" value={`${summary.absences}`} color="text-red-800" />
                <ReportStatCard icon={Icons.clock} title="Total de Horas" value={`${summary.totalHours.toFixed(2)} hrs`} color="text-blue-800" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                     <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Día</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entrada</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salida</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horas Trabajadas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {monthData.map(day => {
                            let statusColor = '';
                            if (day.status === 'Asistencia') statusColor = 'bg-green-100 text-green-800';
                            if (day.status === 'Falta') statusColor = 'bg-red-100 text-red-800';
                            if (day.status === 'Incompleto') statusColor = 'bg-yellow-100 text-yellow-800';
                            if (day.status === 'Fin de Semana') statusColor = 'bg-slate-100 text-slate-600';

                            return (
                                <tr key={day.date}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(day.date + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{day.dayName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatTime(day.clockIn)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatTime(day.clockOut)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{day.hoursWorked > 0 ? day.hoursWorked.toFixed(2) : '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>{day.status}</span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export const AttendancePage: React.FC<AttendancePageProps> = ({ employees, attendanceLog, simulatedDate }) => {
    const [selectedReportEmployeeId, setSelectedReportEmployeeId] = useState<number | null>(employees.find(e => e.status === 'Activo')?.id || null);
    const [selectedReportMonth, setSelectedReportMonth] = useState<string>(simulatedDate.toISOString().slice(0, 7)); // YYYY-MM
    
    const activeEmployees = useMemo(() => employees.filter(e => e.status === EmployeeStatus.Active), [employees]);

    const dailySummary = useMemo(() => {
        const todayKey = toIsoDateString(simulatedDate);
        return activeEmployees
            .map(employee => {
                const log = attendanceLog[employee.id]?.[todayKey] || { clockIn: null, clockOut: null };
                let status: 'Presente' | 'Ausente' | 'Jornada Finalizada';
                let statusColor: string;

                if (log.clockIn && !log.clockOut) {
                    status = 'Presente';
                    statusColor = 'bg-green-100 text-green-800';
                } else if (log.clockIn && log.clockOut) {
                    status = 'Jornada Finalizada';
                    statusColor = 'bg-blue-100 text-blue-800';
                } else {
                    status = 'Ausente';
                    statusColor = 'bg-slate-100 text-slate-800';
                }

                return {
                    ...employee,
                    clockIn: log.clockIn,
                    clockOut: log.clockOut,
                    attendanceStatus: status,
                    statusColor: statusColor,
                };
            });
    }, [activeEmployees, attendanceLog, simulatedDate]);

    const monthlyReportData = useMemo(() => {
        if (!selectedReportEmployeeId) return null;

        const employee = employees.find(e => e.id === selectedReportEmployeeId);
        if (!employee) return null;

        const [year, month] = selectedReportMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const employeeLog = attendanceLog[selectedReportEmployeeId] || {};

        const report = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(year, month - 1, day);
            const dateKey = toIsoDateString(date);
            const dayLog = employeeLog[dateKey] || { clockIn: null, clockOut: null };

            let hoursWorked = 0;
            if (dayLog.clockIn && dayLog.clockOut) {
                const diff = dayLog.clockOut.getTime() - dayLog.clockIn.getTime();
                hoursWorked = diff / (1000 * 60 * 60);
            }

            let status: 'Asistencia' | 'Falta' | 'Incompleto' | 'Fin de Semana';
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                status = 'Fin de Semana';
            } else if (dayLog.clockIn && dayLog.clockOut) {
                status = 'Asistencia';
            } else if (dayLog.clockIn) {
                status = 'Incompleto';
            } else {
                status = 'Falta';
            }
            
            return {
                date: dateKey,
                dayName: date.toLocaleDateString('es-MX', { weekday: 'long' }),
                clockIn: dayLog.clockIn,
                clockOut: dayLog.clockOut,
                hoursWorked,
                status,
            };
        });

        return { employee, report };

    }, [selectedReportEmployeeId, selectedReportMonth, attendanceLog, employees]);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Registro de Asistencia del Día</h1>
                <p className="text-slate-500">Resumen de la actividad de hoy: {simulatedDate.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empleado</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hora de Entrada</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hora de Salida</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estatus del Día</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {dailySummary.map((employee) => (
                            <tr key={employee.id}>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-10 w-10"><img className="h-10 w-10 rounded-full object-cover" src={employee.avatarUrl} alt={employee.name} /></div><div className="ml-4"><div className="text-sm font-medium text-slate-900">{employee.name}</div><div className="text-sm text-slate-500">{employee.position}</div></div></div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatTime(employee.clockIn)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{formatTime(employee.clockOut)}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.statusColor}`}>{employee.attendanceStatus}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pt-8 border-t">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Reporte Mensual por Empleado</h2>
                <p className="text-slate-500 mb-6">Selecciona un empleado y un mes para ver el historial detallado de asistencia.</p>

                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-100 rounded-lg">
                    <div>
                        <label htmlFor="employee-select" className="block text-sm font-medium text-slate-700">Empleado</label>
                        <select
                            id="employee-select"
                            value={selectedReportEmployeeId || ''}
                            onChange={e => setSelectedReportEmployeeId(Number(e.target.value))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                        >
                            <option value="" disabled>Selecciona un empleado</option>
                            {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="month-select" className="block text-sm font-medium text-slate-700">Mes</label>
                        <input
                            type="month"
                            id="month-select"
                            value={selectedReportMonth}
                            onChange={e => setSelectedReportMonth(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                        />
                    </div>
                </div>

                {monthlyReportData ? (
                    <MonthlyAttendanceReport employee={monthlyReportData.employee} monthData={monthlyReportData.report} />
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
                        <p className="text-slate-500">Por favor, selecciona un empleado para ver su reporte.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
