
export enum EmployeeStatus {
    Active = 'Activo',
    Archived = 'Archivado',
}

export enum IncidentType {
    Bonus = 'Bono',
    Overtime = 'Horas Extra',
    Deduction = 'Deducción',
    Advance = 'Anticipo',
    Holiday = 'Festivo',
    Absence = 'Falta (Deducción)',
}

export enum FileCategory {
    Contract = 'Contrato',
    Identification = 'Identificación',
    ProofOfAddress = 'Comprobante de Domicilio',
    CURP = 'CURP',
    BirthCertificate = 'Acta de Nacimiento',
    Other = 'Otros',
}

export enum VacationRequestStatus {
    Approved = 'Aprobada',
    Pending = 'Pendiente',
    Rejected = 'Rechazada',
}

export enum BonusCalculationType {
    Fixed = 'Monto Fijo',
    Percentage = 'Porcentaje de Salario',
}

export type Role = 'super_admin' | 'gerente_sucursal' | 'empleado';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    avatarUrl: string;
    assigned_branch_ids?: number[]; // Only for 'gerente_sucursal'
    employee_id?: number; // Only for 'empleado'
}

export interface Branch {
    id: number;
    name: string;
    code: string;
}

export interface Employee {
    id: number;
    external_id: string;
    name: string;
    email: string;
    rfc: string;
    curp: string;
    nss: string;
    clabe: string;
    branch_id: number;
    position: string;
    rank: string;
    gross_salary: number;
    daily_salary: number;
    hire_date: string;
    status: EmployeeStatus;
    avatarUrl?: string;
}

export interface Incident {
    id: number;
    employee_id: number;
    period: string; // YYYY-MM-QQ
    type: IncidentType;
    amount: number;
    comment: string;
}

export interface BonusTemplate {
    id: number;
    name: string;
    calculation_type: BonusCalculationType;
    value: number; // The fixed amount or the percentage (e.g., 10 for 10%)
    description: string;
}

export interface EmployeeFile {
    id: number;
    employee_id: number;
    name: string;
    category: FileCategory;
    url: string;
    size: number; // in bytes
    mime_type: string;
    uploaded_by: string;
    uploaded_at: string;
    version: number;
}

export interface VacationRequest {
    id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: VacationRequestStatus;
    requested_at: string;
    reviewed_by?: string; // Name of admin/manager
    reviewed_at?: string;
}


export interface PayrollPeriod {
    month: string;
    year: number;
    quincena: 1 | 2;
    range: string;
    status: 'Abierta' | 'En Progreso' | 'Cerrada';
}

export type AttendanceDayLog = { clockIn: Date | null; clockOut: Date | null };
export type AttendanceLog = Record<number, Record<string, AttendanceDayLog>>; // employeeId -> YYYY-MM-DD -> log