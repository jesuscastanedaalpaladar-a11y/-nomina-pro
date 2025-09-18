
import React from 'react';
import { Employee, Incident, IncidentType } from '../../types';
import { formatDate, formatCurrency } from '../../utils/dateUtils';
import { Icon, Icons } from '../ui/Icon';

interface PayslipProps {
    employee: Employee;
    calculation: {
        baseSalary: number;
        earnings: Incident[];
        totalEarnings: number;
        isrDeduction: number;
        imssDeduction: number;
        otherDeductions: Incident[];
        totalDeductions: number;
        netPay: number;
    };
    periodInfo: {
        range: string;
    }
}

const TableRow: React.FC<{ label: string; amount: number; isDeduction?: boolean }> = ({ label, amount, isDeduction = false }) => (
    <tr>
        <td className="py-2 pr-4 text-sm text-slate-600">{label}</td>
        <td className={`py-2 pl-4 text-sm font-medium text-right ${isDeduction ? 'text-red-600' : 'text-slate-800'}`}>{formatCurrency(amount)}</td>
    </tr>
);


export const Payslip: React.FC<PayslipProps> = ({ employee, calculation, periodInfo }) => {
    return (
        <div className="p-4 sm:p-8 font-sans">
            <style>
                {`
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                `}
            </style>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
                <header className="flex justify-between items-center pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-700">Nomina Pro</h1>
                        <p className="text-slate-500">Recibo de Pago de Nómina</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">Periodo de Pago</p>
                        <p className="text-sm text-slate-500">{periodInfo.range}</p>
                        <p className="text-sm text-slate-500">Fecha de Emisión: {formatDate(new Date().toISOString())}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 gap-8 my-6">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Empleado</h2>
                        <p className="font-bold text-slate-800">{employee.name}</p>
                        <p className="text-sm text-slate-600">RFC: {employee.rfc}</p>
                        <p className="text-sm text-slate-600">CURP: {employee.curp}</p>
                        <p className="text-sm text-slate-600">NSS: {employee.nss}</p>
                        <p className="text-sm text-slate-600">Puesto: {employee.position}</p>
                    </div>
                     <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Empresa</h2>
                        <p className="font-bold text-slate-800">Nomina Pro S.A. de C.V.</p>
                        <p className="text-sm text-slate-600">RFC: NPR123456XYZ</p>
                        <p className="text-sm text-slate-600">Registro Patronal: A1234567890</p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Percepciones */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-2">Percepciones</h3>
                        <table className="w-full">
                            <tbody>
                                <TableRow label="Salario Base Quincenal" amount={calculation.baseSalary} />
                                {calculation.earnings.map(item => {
                                    const label = item.type === IncidentType.Bonus ? item.comment : `${item.type} (${item.comment})`;
                                    return <TableRow key={item.id} label={label} amount={item.amount} />;
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="border-t">
                                    <td className="pt-2 pr-4 text-sm font-bold text-slate-800">Total Percepciones</td>
                                    <td className="pt-2 pl-4 text-sm font-bold text-slate-800 text-right">{formatCurrency(calculation.totalEarnings)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {/* Deducciones */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-2">Deducciones</h3>
                        <table className="w-full">
                            <tbody>
                                <TableRow label="ISR (Estimado)" amount={calculation.isrDeduction} isDeduction />
                                <TableRow label="IMSS (Estimado)" amount={calculation.imssDeduction} isDeduction />
                                 {calculation.otherDeductions.map(item => (
                                    <TableRow key={item.id} label={`${item.type} (${item.comment})`} amount={item.amount} isDeduction />
                                ))}
                            </tbody>
                             <tfoot>
                                <tr className="border-t">
                                    <td className="pt-2 pr-4 text-sm font-bold text-slate-800">Total Deducciones</td>
                                    <td className="pt-2 pl-4 text-sm font-bold text-red-600 text-right">{formatCurrency(calculation.totalDeductions)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
                
                <footer className="mt-8 pt-6 border-t-2 border-dashed border-slate-300">
                    <div className="bg-blue-50 p-6 rounded-lg flex justify-between items-center">
                        <h3 className="text-xl font-bold text-blue-800">Neto a Pagar</h3>
                        <p className="text-3xl font-extrabold text-blue-800">{formatCurrency(calculation.netPay)}</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}