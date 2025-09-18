
import { Employee, Branch, Incident, EmployeeFile, EmployeeStatus, IncidentType, FileCategory, User, VacationRequest, VacationRequestStatus, AttendanceLog, BonusTemplate, BonusCalculationType } from './types';

export const MOCK_BRANCHES: Branch[] = [
    { id: 1, name: 'Corporativo CDMX', code: 'CDMX-CORP' },
    { id: 2, name: 'Sucursal Monterrey', code: 'MTY-NORTE' },
    { id: 3, name: 'Sucursal Guadalajara', code: 'GDL-OCC' },
];

export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: 1,
        external_id: 'EMP-001',
        name: 'Ana García Pérez',
        email: 'ana.garcia@example.com',
        rfc: 'GAPN850101XXX',
        curp: 'GAPN850101HDFXXX01',
        nss: '12345678901',
        clabe: '012180012345678901',
        branch_id: 1,
        position: 'Gerente de Nómina',
        rank: 'Gerencia',
        gross_salary: 55000,
        daily_salary: 1833.33,
        hire_date: '2020-03-15',
        status: EmployeeStatus.Active,
        avatarUrl: 'https://picsum.photos/seed/woman1/200'
    },
    {
        id: 2,
        external_id: 'EMP-002',
        name: 'Carlos Rodríguez López',
        email: 'carlos.rodriguez@example.com',
        rfc: 'ROLC900202YYY',
        curp: 'ROLC900202HMCYYY02',
        nss: '23456789012',
        clabe: '012180023456789012',
        branch_id: 2,
        position: 'Desarrollador Senior',
        rank: 'Senior',
        gross_salary: 48000,
        daily_salary: 1600.00,
        hire_date: '2021-07-20',
        status: EmployeeStatus.Active,
        avatarUrl: 'https://picsum.photos/seed/man1/200'
    },
    {
        id: 3,
        external_id: 'EMP-003',
        name: 'Sofía Martínez Hernández',
        email: 'sofia.martinez@example.com',
        rfc: 'MAHS950303ZZZ',
        curp: 'MAHS950303MJCZZZ03',
        nss: '34567890123',
        clabe: '012180034567890123',
        branch_id: 1,
        position: 'Analista de RRHH',
        rank: 'Analista',
        gross_salary: 28000,
        daily_salary: 933.33,
        hire_date: '2022-01-10',
        status: EmployeeStatus.Active,
        avatarUrl: 'https://picsum.photos/seed/woman2/200'
    },
     {
        id: 4,
        external_id: 'EMP-004',
        name: 'Luis Hernández García',
        email: 'luis.hernandez@example.com',
        rfc: 'HEGL880404AAA',
        curp: 'HEGL880404HDFNRA04',
        nss: '45678901234',
        clabe: '012180045678901234',
        branch_id: 3,
        position: 'Gerente de Sucursal',
        rank: 'Gerencia',
        gross_salary: 52000,
        daily_salary: 1733.33,
        hire_date: '2019-11-05',
        status: EmployeeStatus.Active,
        avatarUrl: 'https://picsum.photos/seed/man2/200'
    },
    {
        id: 5,
        external_id: 'EMP-005',
        name: 'Elena Gómez Morales',
        email: 'elena.gomez@example.com',
        rfc: 'GOME920505BBB',
        curp: 'GOME920505MMCNLA05',
        nss: '56789012345',
        clabe: '012180056789012345',
        branch_id: 2,
        position: 'Asistente Administrativo',
        rank: 'Asistente',
        gross_salary: 22000,
        daily_salary: 733.33,
        hire_date: '2023-02-28',
        status: EmployeeStatus.Active,
        avatarUrl: 'https://picsum.photos/seed/woman3/200'
    },
    {
        id: 6,
        external_id: 'EMP-006',
        name: 'Miguel Torres Castillo',
        email: 'miguel.torres@example.com',
        rfc: 'TOCM890606CCC',
        curp: 'TOCM890606HDFTRA06',
        nss: '67890123456',
        clabe: '012180067890123456',
        branch_id: 1,
        position: 'Diseñador UX/UI',
        rank: 'Senior',
        gross_salary: 45000,
        daily_salary: 1500.00,
        hire_date: '2021-09-01',
        status: EmployeeStatus.Archived,
        avatarUrl: 'https://picsum.photos/seed/man3/200'
    }
];

export const MOCK_INCIDENTS: Incident[] = [
    { id: 1, employee_id: 2, period: '2024-07-Q2', type: IncidentType.Bonus, amount: 2500, comment: 'Bono por desempeño trimestral' },
    { id: 2, employee_id: 3, period: '2024-07-Q2', type: IncidentType.Overtime, amount: 850, comment: '5 horas extra por cierre de mes' },
    { id: 3, employee_id: 5, period: '2024-07-Q2', type: IncidentType.Advance, amount: -1500, comment: 'Adelanto de nómina solicitado' },
    { id: 4, employee_id: 2, period: '2024-07-Q1', type: IncidentType.Deduction, amount: -500, comment: 'Descuento por equipo dañado' }
];

export const MOCK_BONUS_TEMPLATES: BonusTemplate[] = [
    { id: 1, name: 'Bono de Desempeño Trimestral', calculation_type: BonusCalculationType.Fixed, value: 2500, description: 'Bono fijo por cumplimiento de metas trimestrales.' },
    { id: 2, name: 'Bono de Resultados de Ventas', calculation_type: BonusCalculationType.Percentage, value: 5, description: '5% del salario bruto mensual por alcanzar la cuota de ventas.' },
    { id: 3, name: 'Bono de Puntualidad', calculation_type: BonusCalculationType.Fixed, value: 500, description: 'Bono fijo por asistencia perfecta durante el periodo.' },
    { id: 4, name: 'Comisión Especial', calculation_type: BonusCalculationType.Fixed, value: 1000, description: 'Comisión por proyecto o venta especial.' }
];

export const MOCK_VACATION_REQUESTS: VacationRequest[] = [
    {
        id: 1,
        employee_id: 2, // Carlos Rodríguez
        start_date: '2024-04-10',
        end_date: '2024-04-12',
        days_requested: 3,
        status: VacationRequestStatus.Approved,
        requested_at: '2024-03-15T09:00:00Z',
        reviewed_by: 'Admin Nómina',
        reviewed_at: '2024-03-16T11:00:00Z',
    },
    {
        id: 2,
        employee_id: 3, // Sofía Martínez
        start_date: '2023-12-22',
        end_date: '2023-12-29',
        days_requested: 5,
        status: VacationRequestStatus.Approved,
        requested_at: '2023-11-20T14:30:00Z',
        reviewed_by: 'Admin Nómina',
        reviewed_at: '2023-11-21T10:00:00Z',
    },
    {
        id: 3,
        employee_id: 2,
        start_date: '2024-08-19',
        end_date: '2024-08-23',
        days_requested: 5,
        status: VacationRequestStatus.Pending,
        requested_at: '2024-07-25T16:00:00Z',
    },
     {
        id: 4,
        employee_id: 5, // Elena Gómez
        start_date: '2024-09-02',
        end_date: '2024-09-06',
        days_requested: 5,
        status: VacationRequestStatus.Pending,
        requested_at: '2024-07-28T10:00:00Z',
    }
];

export const MOCK_FILES: EmployeeFile[] = [
    { id: 1, employee_id: 1, name: 'Contrato_Ana_Garcia.pdf', category: FileCategory.Contract, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: 120456, mime_type: 'application/pdf', uploaded_by: 'Admin', uploaded_at: '2020-03-15T10:00:00Z', version: 1 },
    { id: 2, employee_id: 1, name: 'INE_Ana_Garcia.jpg', category: FileCategory.Identification, url: '#', size: 80234, mime_type: 'image/jpeg', uploaded_by: 'Ana García', uploaded_at: '2020-03-15T10:05:00Z', version: 1 },
    { id: 3, employee_id: 1, name: 'Comprobante_Domicilio_Luz.pdf', category: FileCategory.ProofOfAddress, url: '#', size: 250678, mime_type: 'application/pdf', uploaded_by: 'Ana García', uploaded_at: '2020-03-15T10:06:00Z', version: 1 },
    { id: 4, employee_id: 2, name: 'Contrato_Laboral_Carlos_Rodriguez_v2.pdf', category: FileCategory.Contract, url: '#', size: 135000, mime_type: 'application/pdf', uploaded_by: 'Admin', uploaded_at: '2021-07-20T09:00:00Z', version: 2 },
];

export const MOCK_USERS: { [key: string]: User } = {
    admin: {
        id: 101,
        name: 'Admin Nómina',
        email: 'admin@nomina.pro',
        role: 'super_admin',
        avatarUrl: 'https://picsum.photos/seed/admin/200',
    },
    manager: {
        id: 102,
        name: 'Gerente Sucursal',
        email: 'manager@nomina.pro',
        role: 'gerente_sucursal',
        avatarUrl: 'https://picsum.photos/seed/manager/200',
        assigned_branch_ids: [2, 3], // Monterrey and Guadalajara
    },
    employee: {
        id: 103,
        name: 'Sofía Martínez',
        email: 'sofia.martinez@example.com',
        role: 'empleado',
        avatarUrl: 'https://picsum.photos/seed/woman2/200',
        employee_id: 3,
    }
};

const generateMockAttendance = () => {
    const log: AttendanceLog = {};
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const employeeIds = [2, 3, 5];

    employeeIds.forEach(id => {
        log[id] = {};
        // Generate logs for previous days only, not for today.
        for (let day = 1; day < today.getDate(); day++) {
            const date = new Date(year, month, day);
            if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

            const dateKey = date.toISOString().split('T')[0];
            const random = Math.random();

            if (random < 0.8) { // 80% chance of being present
                 const clockIn = new Date(date);
                 clockIn.setHours(9, Math.floor(Math.random() * 20) - 10); // 8:50 - 9:10
                 const clockOut = new Date(date);
                 clockOut.setHours(18, Math.floor(Math.random() * 20) - 10); // 17:50 - 18:10
                 log[id][dateKey] = { clockIn, clockOut };
            } else if (random < 0.9) { // 10% chance of being incomplete
                 const clockIn = new Date(date);
                 clockIn.setHours(9, Math.floor(Math.random() * 20) - 10);
                 log[id][dateKey] = { clockIn, clockOut: null };
            }
            // 10% chance of being absent (do nothing)
        }
    });

    return log;
};

export const MOCK_ATTENDANCE_LOG: AttendanceLog = generateMockAttendance();