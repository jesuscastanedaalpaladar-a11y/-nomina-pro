
import React, { useState, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Employee, FileCategory, Incident, EmployeeStatus } from '../types';
import { Icon, Icons } from '../components/ui/Icon';
import { getCurrentPayrollPeriod, getCurrentPayrollPeriodIdentifier, formatCurrency, formatDate } from '../utils/dateUtils';
import { Payslip } from '../components/payroll/Payslip';
import { calculatePayroll, PayrollCalculationType } from '../utils/payrollUtils';

interface EmployeeSelfServicePageProps {
    employee: Employee;
    onUpdateEmployee: (updatedEmployee: Employee) => void;
    simulatedDate: Date;
    attendanceRecord: { clockIn: Date | null; clockOut: Date | null };
    onAttendanceUpdate: () => void;
    signedPayslips: Record<string, number[]>;
    onSignPayslip: (employeeId: number, periodId: string) => void;
    incidents: Incident[];
}

const StatCard: React.FC<{ icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: string | React.ReactNode; }> = ({ icon, label, value }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="bg-brand-100 p-3 rounded-full">
            <Icon icon={icon} className="w-6 h-6 text-brand-600" />
        </div>
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const PayslipSignatureModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirmSignature: () => void;
    employee: Employee;
    calculation: PayrollCalculationType;
    periodInfo: { range: string };
}> = ({ isOpen, onClose, onConfirmSignature, employee, calculation, periodInfo }) => {
    const [signatureName, setSignatureName] = useState('');
    
    // Normalizing strings to be more forgiving with accents, case, and whitespace.
    const normalize = (str: string) => 
        str
            .normalize("NFD") // Decompose accented characters
            .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
            .trim()
            .toLowerCase();

    const isSignatureValid = normalize(signatureName) === normalize(employee.name);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl m-4 max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b bg-white rounded-t-xl">
                    <button onClick={onClose} className="float-right p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Cerrar modal">
                        <Icon icon={Icons.x} className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">Revisión y Firma de Recibo de Nómina</h2>
                </div>
                <div className="overflow-y-auto flex-1">
                    <Payslip employee={employee} calculation={calculation} periodInfo={periodInfo} />
                </div>
                <div className="p-4 border-t bg-white rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        <label htmlFor="signature" className="block text-xs font-medium text-slate-600">
                            Para firmar, escribe tu nombre completo como aparece en tu perfil: <span className="font-bold">{employee.name}</span>
                        </label>
                        <input
                            type="text"
                            id="signature"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            placeholder="Escribe tu nombre aquí para confirmar..."
                            className="mt-1 w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                            aria-describedby="signature-helper-text"
                        />
                         <p id="signature-helper-text" className="text-xs text-slate-500 mt-1">Al firmar, confirmas que has revisado y estás de acuerdo con este recibo.</p>
                    </div>
                    <button
                        onClick={onConfirmSignature}
                        disabled={!isSignatureValid}
                        className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Icon icon={Icons.check} className="w-5 h-5" />
                        Firmar de Recibido
                    </button>
                </div>
            </div>
        </div>
    );
};

export const EmployeeSelfServicePage: React.FC<EmployeeSelfServicePageProps> = ({ employee, simulatedDate, attendanceRecord, onAttendanceUpdate, signedPayslips, onSignPayslip, incidents }) => {
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
    
    const requiredDocs: { category: FileCategory, label: string }[] = [
        { category: FileCategory.CURP, label: 'CURP' },
        { category: FileCategory.BirthCertificate, label: 'Acta de Nacimiento' },
        { category: FileCategory.ProofOfAddress, label: 'Comprobante de Domicilio' }
    ];

    const [documents, setDocuments] = useState(
        requiredDocs.map(doc => ({ ...doc, status: 'pending', fileName: undefined as string | undefined }))
    );
    
    const handleFileUpload = (category: FileCategory, file: File) => {
        setDocuments(docs => docs.map(doc => doc.category === category ? { ...doc, status: 'uploaded', fileName: file.name } : doc));
        alert(`Archivo "${file.name}" subido para ${category} (simulación).`);
    };

    const { payrollCalculation, periodInfo, periodIdentifier } = useMemo(() => {
        const calculation = calculatePayroll(employee, incidents, simulatedDate);
        const period = getCurrentPayrollPeriod(simulatedDate);
        const identifier = getCurrentPayrollPeriodIdentifier(simulatedDate);
        return { payrollCalculation: calculation, periodInfo: period, periodIdentifier: identifier };
    }, [employee, incidents, simulatedDate]);

    const isPayslipSigned = signedPayslips[periodIdentifier]?.includes(employee.id) ?? false;

    const handleConfirmSignature = () => {
        onSignPayslip(employee.id, periodIdentifier);
        setIsPayslipModalOpen(false);
        alert('Recibo firmado exitosamente.');
    };
    
    const handleDownloadPdf = () => {
        const payslipComponent = <Payslip employee={employee} calculation={payrollCalculation} periodInfo={periodInfo} />;
        const payslipHtml = ReactDOMServer.renderToString(payslipComponent);

        const fullHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <title>Recibo de Nómina - ${employee.name}</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
                ${payslipHtml}
            </body>
            </html>
        `;

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(fullHtml);
            newWindow.document.close();
            setTimeout(() => newWindow.print(), 500); // Wait for styles to apply
        } else {
            alert('No se pudo abrir la ventana. Por favor, deshabilita el bloqueador de pop-ups.');
        }
    };


    const getStatusInfo = (status: string): { text: string; icon: React.ComponentType<any>, color: string } => {
        switch (status) {
            case 'pending': return { text: 'Pendiente', icon: Icons.upload, color: 'text-slate-500' };
            case 'uploaded': return { text: 'En Revisión', icon: Icons.checkCircle, color: 'text-yellow-600' };
            default: return { text: 'Aprobado', icon: Icons.checkCircle, color: 'text-green-600' };
        }
    };

    const hasClockedIn = !!attendanceRecord.clockIn;
    const hasClockedOut = !!attendanceRecord.clockOut;
    const isWorkdayFinished = hasClockedIn && hasClockedOut;

    return (
        <>
            <div className="p-6 sm:p-8 space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-slate-800">Bienvenido de vuelta, {employee.name.split(' ')[0]}</h1>
                    <p className="text-slate-500">Aquí tienes un resumen de tu perfil y tareas pendientes.</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={Icons.userCircle} label="Puesto" value={employee.position} />
                    <StatCard icon={Icons.calendar} label="Antigüedad" value={`${new Date(simulatedDate).getFullYear() - new Date(employee.hire_date).getFullYear()} años`} />
                    <StatCard icon={Icons.sun} label="Días de Vacaciones" value="12 disponibles" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Nómina Card */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                             <h2 className="text-xl font-bold text-slate-800 mb-4">Nómina del Periodo: {periodInfo.range}</h2>
                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-brand-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-brand-700">Neto a Pagar</p>
                                    <p className="text-4xl font-extrabold text-brand-800">{formatCurrency(payrollCalculation.netPay)}</p>
                                </div>
                                 <div className="mt-4 sm:mt-0">
                                    {isPayslipSigned ? (
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-2 text-green-700 bg-green-100 px-4 py-2 rounded-lg font-semibold">
                                                <Icon icon={Icons.checkCircle} className="w-6 h-6" />
                                                Firmado de Recibido
                                            </span>
                                            <button 
                                                onClick={handleDownloadPdf}
                                                className="px-5 py-3 text-sm font-semibold text-white bg-slate-600 rounded-lg shadow-sm hover:bg-slate-700 flex items-center gap-2">
                                                <Icon icon={Icons.download} className="w-5 h-5" />
                                                Descargar PDF
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setIsPayslipModalOpen(true)}
                                            className="px-5 py-3 text-sm font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 flex items-center gap-2">
                                            <Icon icon={Icons.documentText} className="w-5 h-5" />
                                            Ver y Firmar Recibo
                                        </button>
                                    )}
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Asistencia Card */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                             <h2 className="text-xl font-bold text-slate-800 mb-4">Registro de Asistencia</h2>
                            {isWorkdayFinished ? (
                                 <div className="flex flex-col items-center justify-center h-full py-4 bg-slate-100 rounded-lg">
                                    <Icon icon={Icons.checkCircle} className="w-12 h-12 text-green-500" />
                                    <p className="mt-2 font-semibold text-slate-700">Jornada finalizada</p>
                                    <p className="text-sm text-slate-500">¡Buen trabajo!</p>
                                </div>
                            ) : (
                                <button
                                    onClick={onAttendanceUpdate}
                                    className={`w-full py-4 text-lg font-bold text-white rounded-lg transition-colors ${
                                        !hasClockedIn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {!hasClockedIn ? 'Registrar Entrada' : 'Registrar Salida'}
                                </button>
                            )}
                        </div>
                         {/* Mis Datos Card */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Mis Datos</h2>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between"><dt className="text-slate-500">RFC</dt><dd className="font-mono text-slate-700">{employee.rfc}</dd></div>
                                <div className="flex justify-between"><dt className="text-slate-500">CURP</dt><dd className="font-mono text-slate-700">{employee.curp}</dd></div>
                                <div className="flex justify-between"><dt className="text-slate-500">NSS</dt><dd className="font-mono text-slate-700">{employee.nss}</dd></div>
                            </dl>
                            <button className="mt-4 w-full text-center text-sm font-semibold text-brand-600 hover:underline" onClick={() => alert('Simulación: Se ha enviado una solicitud para corregir tus datos al departamento de RRHH.')}>
                                ¿Ves un error? Solicita una corrección
                            </button>
                        </div>
                    </div>
                </div>

                {/* Documentos Card (Collapsible) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
                        className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 rounded-t-xl"
                        aria-expanded={isDocumentsOpen}
                        aria-controls="document-section"
                    >
                        <h2 className="text-xl font-bold text-slate-800">Mis Documentos</h2>
                        <Icon icon={Icons.chevronDown} className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isDocumentsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDocumentsOpen && (
                         <div id="document-section" className="p-6 pt-0 border-t">
                            <ul className="space-y-3 mt-4">
                                {documents.map(doc => {
                                    const statusInfo = getStatusInfo(doc.status);
                                    return (
                                        <li key={doc.category} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Icon icon={statusInfo.icon} className={`w-6 h-6 ${statusInfo.color}`} />
                                                <div className="ml-3">
                                                    <p className="font-semibold text-slate-700">{doc.label}</p>
                                                    <p className="text-xs text-slate-500">{doc.fileName || 'Ningún archivo subido'}</p>
                                                </div>
                                            </div>
                                            {doc.status === 'pending' && (
                                                <label className="cursor-pointer text-sm font-semibold text-brand-600 hover:text-brand-800">
                                                    Subir
                                                    <input type="file" className="sr-only" onChange={(e) => e.target.files && handleFileUpload(doc.category, e.target.files[0])} />
                                                </label>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            
            <PayslipSignatureModal 
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                onConfirmSignature={handleConfirmSignature}
                employee={employee}
                calculation={payrollCalculation}
                periodInfo={periodInfo}
            />
        </>
    );
};