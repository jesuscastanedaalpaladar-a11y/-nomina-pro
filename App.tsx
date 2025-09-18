
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { EmployeeList } from './pages/EmployeeList';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { PayrollPage } from './pages/PayrollPage';
import { MOCK_EMPLOYEES, MOCK_USERS, MOCK_ATTENDANCE_LOG, MOCK_INCIDENTS, MOCK_BONUS_TEMPLATES, MOCK_BRANCHES } from './constants';
import { User, Employee, EmployeeStatus, AttendanceLog, Incident, BonusTemplate, IncidentType, Branch } from './types';
import { advanceDateToNextPeriod, toIsoDateString, getCurrentPayrollPeriodIdentifier } from './utils/dateUtils';
import { EmployeeSelfServicePage } from './pages/EmployeeSelfServicePage';
import { AttendancePage } from './pages/AttendancePage';
import { BonusPage } from './pages/BonusPage';
import { ReportsPage } from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export type Page = 'dashboard' | 'employees' | 'payroll' | 'attendance' | 'bonuses' | 'reports' | 'settings';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.admin);
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [paymentStatus, setPaymentStatus] = useState<Record<number, boolean>>({});
    const [simulatedDate, setSimulatedDate] = useState(() => new Date());
    const [attendanceLog, setAttendanceLog] = useState<AttendanceLog>(MOCK_ATTENDANCE_LOG);
    const [signedPayslips, setSignedPayslips] = useState<Record<string, number[]>>({});
    const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
    const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>(MOCK_BONUS_TEMPLATES);
    const [users, setUsers] = useState<User[]>(Object.values(MOCK_USERS));
    const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);


    useEffect(() => {
        // RLS check: When user or selection changes, ensure they have access.
        if (selectedEmployeeId !== null && currentUser.role === 'gerente_sucursal') {
            const employee = employees.find(e => e.id === selectedEmployeeId);
            if (employee && !currentUser.assigned_branch_ids?.includes(employee.branch_id)) {
                setSelectedEmployeeId(null); // Deselect if no longer accessible
            }
        }
        
        // If user is switched to employee, reset view
        if (currentUser.role !== 'empleado') {
             if (currentPage === 'dashboard' && selectedEmployeeId !== null) {
                setSelectedEmployeeId(null);
             }
        } else {
            // For employee role, we don't set a page, it's a fixed view.
        }

    }, [currentUser, selectedEmployeeId, currentPage, employees]);

    const handleSelectEmployee = useCallback((id: number) => {
        setSelectedEmployeeId(id);
    }, []);

    const handleNavigate = useCallback((page: Page) => {
        setCurrentPage(page);
        setSelectedEmployeeId(null); // Reset employee selection when changing main pages
    }, []);

    const handleSetCurrentUser = useCallback((user: User) => {
        setCurrentUser(user);
        setPaymentStatus({}); // Reset payment progress on user switch
        setSimulatedDate(new Date()); // Reset date on user switch for a fresh start
    }, []);

    const handleAddEmployee = useCallback((newEmployeeData: Omit<Employee, 'id'>) => {
        setEmployees(prevEmployees => {
            const newEmployee: Employee = {
                ...newEmployeeData,
                id: Math.max(0, ...prevEmployees.map(e => e.id)) + 1,
            };
            return [...prevEmployees, newEmployee];
        });
        alert('Empleado agregado exitosamente.');
    }, []);

    const handleUpdateEmployee = useCallback((updatedEmployee: Employee) => {
        setEmployees(prevEmployees => 
            prevEmployees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e)
        );
        // The alert for this is in the detail page for better user experience
    }, []);
    
    const handleArchiveEmployee = useCallback((employeeId: number) => {
        setEmployees(prevEmployees =>
            prevEmployees.map(e =>
                e.id === employeeId ? { ...e, status: EmployeeStatus.Archived } : e
            )
        );
        if (selectedEmployeeId === employeeId) {
            setSelectedEmployeeId(null);
        }
        alert('Empleado archivado exitosamente.');
    }, [selectedEmployeeId]);

    const handlePayEmployee = useCallback((employeeId: number) => {
        setPaymentStatus(prevStatus => ({
            ...prevStatus,
            [employeeId]: true,
        }));
    }, []);

     const handleSignPayslip = useCallback((employeeId: number, periodId: string) => {
        setSignedPayslips(prev => {
            const periodSigners = prev[periodId] ? [...prev[periodId]] : [];
            if (!periodSigners.includes(employeeId)) {
                periodSigners.push(employeeId);
            }
            return { ...prev, [periodId]: periodSigners };
        });
    }, []);
    
    const handleAddIncident = useCallback((employeeId: number, newIncidentData: Omit<Incident, 'id' | 'period' | 'employee_id'>) => {
        const periodIdentifier = getCurrentPayrollPeriodIdentifier(simulatedDate);

        const incidentToAdd: Incident = {
            ...newIncidentData,
            id: Date.now(),
            employee_id: employeeId,
            period: periodIdentifier,
        };
        setIncidents(prev => [...prev, incidentToAdd]);
        alert('Incidencia agregada exitosamente.');
    }, [simulatedDate]);


    const handleAssignBonuses = useCallback((assignments: { employeeId: number, amount: number }[], bonusTemplate: BonusTemplate) => {
        const periodIdentifier = getCurrentPayrollPeriodIdentifier(simulatedDate);
        
        const newIncidents: Incident[] = assignments.map((assignment, index) => ({
            id: Date.now() + index,
            employee_id: assignment.employeeId,
            period: periodIdentifier,
            type: IncidentType.Bonus,
            amount: assignment.amount,
            comment: bonusTemplate.name,
        }));
        
        setIncidents(prev => [...prev, ...newIncidents]);
    }, [simulatedDate]);
    
    const handleAddBonusTemplate = useCallback((newTemplateData: Omit<BonusTemplate, 'id'>) => {
        setBonusTemplates(prevTemplates => {
            const newTemplate: BonusTemplate = {
                ...newTemplateData,
                id: Math.max(0, ...prevTemplates.map(t => t.id)) + 1,
            };
            return [...prevTemplates, newTemplate];
        });
        alert('Nuevo tipo de bono creado exitosamente.');
    }, []);

    const handleAttendanceUpdate = useCallback((employeeId: number, date: Date) => {
        const dateKey = toIsoDateString(date);
        setAttendanceLog(prevLog => {
            const employeeLog = prevLog[employeeId] || {};
            const dayLog = employeeLog[dateKey] || { clockIn: null, clockOut: null };

            let updatedDayLog;
            if (!dayLog.clockIn) { // Clocking in
                updatedDayLog = { ...dayLog, clockIn: new Date() };
            } else if (!dayLog.clockOut) { // Clocking out
                updatedDayLog = { ...dayLog, clockOut: new Date() };
            } else {
                return prevLog; // Day is already complete
            }

            return {
                ...prevLog,
                [employeeId]: {
                    ...employeeLog,
                    [dateKey]: updatedDayLog,
                },
            };
        });
    }, []);

    const handleClosePeriod = useCallback(() => {
        setSimulatedDate(prevDate => advanceDateToNextPeriod(prevDate));
        setPaymentStatus({});
        setSignedPayslips({});
        setIncidents(MOCK_INCIDENTS); // Reset incidents for new period
        alert('Periodo cerrado. Avanzando al siguiente ciclo de nómina.');
        setCurrentPage('dashboard');
    }, []);

    // User management functions
    const handleAddUser = useCallback((newUserData: Omit<User, 'id'>) => {
        setUsers(prevUsers => {
            const newUser: User = {
                ...newUserData,
                id: Math.max(...prevUsers.map(u => u.id), 0) + 1
            };
            return [...prevUsers, newUser];
        });
    }, []);

    const handleUpdateUser = useCallback((userId: number, updatedUserData: Partial<User>) => {
        setUsers(prevUsers => 
            prevUsers.map(u => u.id === userId ? { ...u, ...updatedUserData } : u)
        );
    }, []);

    const handleDeleteUser = useCallback((userId: number) => {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    }, []);

    // RLS: Employee View
    if (currentUser.role === 'empleado' && currentUser.employee_id) {
        const employee = employees.find(e => e.id === currentUser.employee_id);
        const dateKey = toIsoDateString(simulatedDate);
        const attendanceRecord = attendanceLog[currentUser.employee_id]?.[dateKey] || { clockIn: null, clockOut: null };

        if (employee) {
            return (
                 <div className="flex h-screen bg-slate-100">
                    <Sidebar currentPage={'employees'} onNavigate={() => {}} isNavDisabled={true} />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header title="Mi Perfil" currentUser={currentUser} onSwitchUser={handleSetCurrentUser} />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100">
                           <EmployeeSelfServicePage
                                employee={employee}
                                onUpdateEmployee={handleUpdateEmployee}
                                simulatedDate={simulatedDate}
                                onAttendanceUpdate={() => handleAttendanceUpdate(employee.id, simulatedDate)}
                                attendanceRecord={attendanceRecord}
                                signedPayslips={signedPayslips}
                                onSignPayslip={handleSignPayslip}
                                incidents={incidents}
                           />
                        </main>
                    </div>
                </div>
            );
        }
    }

    // Admin / Manager View
    const renderPage = () => {
        if (selectedEmployeeId !== null) {
            const employee = employees.find(e => e.id === selectedEmployeeId);
            if (employee) {
                return <EmployeeDetail 
                    employee={employee} 
                    onBack={() => setSelectedEmployeeId(null)} 
                    currentUser={currentUser} 
                    onUpdateEmployee={handleUpdateEmployee}
                    simulatedDate={simulatedDate}
                    signedPayslips={signedPayslips}
                    incidents={incidents}
                    onAddIncident={handleAddIncident}
                />;
            }
        }
        
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard onNavigate={handleNavigate} paymentStatus={paymentStatus} employees={employees} simulatedDate={simulatedDate} />;
            case 'employees':
                return <EmployeeList 
                    employees={employees}
                    onSelectEmployee={handleSelectEmployee} 
                    currentUser={currentUser} 
                    onAddEmployee={handleAddEmployee}
                    onArchiveEmployee={handleArchiveEmployee}
                    incidents={incidents}
                />;
            case 'payroll':
                return <PayrollPage
                    employees={employees}
                    currentUser={currentUser}
                    paymentStatus={paymentStatus}
                    onPayEmployee={handlePayEmployee}
                    onSelectEmployee={handleSelectEmployee}
                    onClosePeriod={handleClosePeriod}
                    simulatedDate={simulatedDate}
                    signedPayslips={signedPayslips}
                    incidents={incidents}
                />;
            case 'attendance':
                return <AttendancePage employees={employees} attendanceLog={attendanceLog} simulatedDate={simulatedDate} />;
            case 'bonuses':
                return <BonusPage
                    employees={employees}
                    bonusTemplates={bonusTemplates}
                    onAssignBonuses={handleAssignBonuses}
                    simulatedDate={simulatedDate}
                    currentUser={currentUser}
                    onAddBonusTemplate={handleAddBonusTemplate}
                />;
            case 'reports':
                return <ReportsPage employees={employees} />;
            case 'settings':
                return <SettingsPage
                    currentUser={currentUser}
                    users={users}
                    branches={branches}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                />;
            default:
                return <Dashboard onNavigate={handleNavigate} paymentStatus={paymentStatus} employees={employees} simulatedDate={simulatedDate} />;
        }
    };
    
    const getPageTitle = () => {
        if (selectedEmployeeId !== null) {
            const employee = employees.find(e => e.id === selectedEmployeeId);
            // Check access before showing title
            if (currentUser.role === 'super_admin' || (employee && currentUser.assigned_branch_ids?.includes(employee.branch_id))) {
                 return "Expediente de Empleado";
            }
        }
        switch (currentPage) {
            case 'dashboard':
                return 'Panel General';
            case 'employees':
                return 'Empleados';
            case 'payroll':
                return 'Procesar Nómina';
            case 'attendance':
                return 'Asistencia';
            case 'bonuses':
                return 'Asignar Bonos';
            case 'reports':
                return 'Reportes';
            case 'settings':
                return 'Configuración';
            default:
                return 'Panel General';
        }
    };

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={getPageTitle()} currentUser={currentUser} onSwitchUser={handleSetCurrentUser} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
