
import { PayrollPeriod } from '../types';

const getMexicoCityTime = (from: Date): Date => {
    // This is a simplified approach. For production, a robust library like date-fns-tz is recommended.
    const utcDate = new Date(from.toUTCString());
    utcDate.setHours(utcDate.getHours() - 6); // CST offset
    return utcDate;
}

export const getCurrentPayrollPeriod = (currentDate: Date): PayrollPeriod => {
    const localNow = getMexicoCityTime(currentDate);
    
    const year = localNow.getFullYear();
    const month = localNow.getMonth(); // 0-11
    const day = localNow.getDate();

    const monthName = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(localNow);
    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    if (day <= 15) {
        return {
            year,
            month: capitalizedMonthName,
            quincena: 1,
            range: `01 - 15 de ${capitalizedMonthName}`,
            status: 'Abierta',
        };
    } else {
        return {
            year,
            month: capitalizedMonthName,
            quincena: 2,
            range: `16 - ${lastDayOfMonth} de ${capitalizedMonthName}`,
            status: 'Abierta',
        };
    }
};

export const getCurrentPayrollPeriodIdentifier = (currentDate: Date): string => {
    const localNow = getMexicoCityTime(currentDate);
    const year = localNow.getFullYear();
    const month = (localNow.getMonth() + 1).toString().padStart(2, '0');
    const day = localNow.getDate();
    const quincena = day <= 15 ? 'Q1' : 'Q2';
    return `${year}-${month}-${quincena}`;
};

export const advanceDateToNextPeriod = (currentDate: Date): Date => {
    const localDate = getMexicoCityTime(currentDate);
    const day = localDate.getDate();

    if (day <= 15) {
        // Current period is Q1, advance to Q2
        return new Date(localDate.getFullYear(), localDate.getMonth(), 16);
    } else {
        // Current period is Q2, advance to Q1 of next month
        return new Date(localDate.getFullYear(), localDate.getMonth() + 1, 1);
    }
};


export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(correctedDate);
};

export const toIsoDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const calculateYearsOfService = (hireDate: string, currentDate: Date): number => {
    const start = new Date(hireDate);
    // This is a simple calculation for completed years
    let years = currentDate.getFullYear() - start.getFullYear();
    const monthDiff = currentDate.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < start.getDate())) {
        years--;
    }
    return Math.max(0, years);
};

export const getVacationDaysAccrued = (completedYears: number): number => {
    // Based on Mexican Labor Law (LFT Artículo 76), updated in 2023
    if (completedYears < 1) return 0;
    if (completedYears === 1) return 12;
    if (completedYears === 2) return 14;
    if (completedYears === 3) return 16;
    if (completedYears === 4) return 18;
    if (completedYears === 5) return 20;
    if (completedYears >= 6 && completedYears <= 10) return 22;
    if (completedYears >= 11 && completedYears <= 15) return 24;
    if (completedYears >= 16 && completedYears <= 20) return 26;
    if (completedYears >= 21 && completedYears <= 25) return 28;
    if (completedYears >= 26 && completedYears <= 30) return 30;
    if (completedYears >= 31) return 32;
    return 0;
};
