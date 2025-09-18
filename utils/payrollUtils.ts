import { Employee, Incident } from '../types';
import { getCurrentPayrollPeriodIdentifier } from './dateUtils';

const SIMULATED_ISR_RATE = 0.20; // 20% ISR (simulated)
const SIMULATED_IMSS_RATE = 0.05; // 5% IMSS (simulated)

export type PayrollCalculationType = {
    baseSalary: number;
    earnings: Incident[];
    totalEarnings: number;
    isrDeduction: number;
    imssDeduction: number;
    otherDeductions: Incident[];
    totalDeductions: number;
    netPay: number;
};

export const calculatePayroll = (
    employee: Employee, 
    allIncidents: Incident[], 
    simulatedDate: Date
): PayrollCalculationType => {
    const periodIdentifier = getCurrentPayrollPeriodIdentifier(simulatedDate);
    const incidents = allIncidents.filter(i => i.employee_id === employee.id && i.period === periodIdentifier);

    const baseSalary = employee.gross_salary / 2;
    
    const earnings = incidents.filter(i => i.amount > 0);
    const totalEarnings = baseSalary + earnings.reduce((sum, i) => sum + i.amount, 0);

    const isrDeduction = totalEarnings * SIMULATED_ISR_RATE;
    const imssDeduction = totalEarnings * SIMULATED_IMSS_RATE;

    const otherDeductions = incidents.filter(i => i.amount < 0);
    const totalOtherDeductionsValue = otherDeductions.reduce((sum, i) => sum + i.amount, 0);

    const totalDeductions = isrDeduction + imssDeduction + Math.abs(totalOtherDeductionsValue);
    const netPay = totalEarnings - totalDeductions;

    return { baseSalary, earnings, totalEarnings, isrDeduction, imssDeduction, otherDeductions, totalDeductions, netPay };
};
