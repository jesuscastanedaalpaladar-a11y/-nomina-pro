
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Employee, EmployeeFile, FileCategory, Incident, IncidentType, User, VacationRequest, VacationRequestStatus, EmployeeStatus } from '../types';
import { MOCK_BRANCHES, MOCK_FILES, MOCK_VACATION_REQUESTS } from '../constants';
import { formatDate, formatCurrency, getCurrentPayrollPeriod, getCurrentPayrollPeriodIdentifier, calculateYearsOfService, getVacationDaysAccrued } from '../utils/dateUtils';
import { Icon, Icons } from '../components/ui/Icon';
import { Payslip } from '../components/payroll/Payslip';
import { calculatePayroll, PayrollCalculationType } from '../utils/payrollUtils';

interface EmployeeDetailProps {
    employee: Employee;
    onBack: () => void;
    currentUser: User;
    onUpdateEmployee: (updatedEmployee: Employee) => void;
    simulatedDate: Date;
    signedPayslips: Record<string, number[]>;
    incidents: Incident[];
    onAddIncident: (employeeId: number, newIncidentData: Omit<Incident, 'id' | 'period' | 'employee_id'>) => void;
}

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 flex justify-between items-center">
            <span>{label}</span>
            {children}
        </dt>
        <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
);


const mask = (value: string, visibleChars: number = 4) => {
    if (!value || value.length <= visibleChars) return value;
    return '•'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

const FileUploader: React.FC<{ onUpload: (files: File[]) => void }> = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onUpload(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         if (e.target.files && e.target.files.length > 0) {
            onUpload(Array.from(e.target.files));
        }
    }

    return (
        <div 
            className={`relative border-2 border-dashed rounded-lg p-12 text-center hover:border-brand-500 ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <Icon icon={Icons.upload} className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 block text-sm text-slate-600">
                Arrastra y suelta archivos aquí
            </p>
            <p className="text-xs text-slate-500">o</p>
            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500">
                <span>selecciona para subir</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
            </label>
        </div>
    );
};

const FilesSection: React.FC<{ employeeId: number }> = ({ employeeId }) => {
    const [files, setFiles] = useState<EmployeeFile[]>(() => MOCK_FILES.filter(f => f.employee_id === employeeId));

    const handleUpload = useCallback((uploadedFiles: File[]) => {
        const newFiles: EmployeeFile[] = uploadedFiles.map((file, index) => ({
            id: Date.now() + index,
            employee_id: employeeId,
            name: file.name,
            category: FileCategory.Other, // Default category
            url: '#',
            size: file.size,
            mime_type: file.type,
            uploaded_by: 'Admin (Simulado)',
            uploaded_at: new Date().toISOString(),
            version: 1,
        }));
        setFiles(prev => [...prev, ...newFiles]);
        alert(`${newFiles.length} archivo(s) subido(s) exitosamente (simulación).`);
    }, [employeeId]);

    const getFileIcon = (mimeType: string) => {
        if (mimeType === 'application/pdf') return Icons.pdfFile;
        if (mimeType.startsWith('image/')) return Icons.imageFile;
        return Icons.file;
    };
    
    return (
        <div className="space-y-6">
            <FileUploader onUpload={handleUpload} />
             <div className="mt-6 border-t border-slate-200">
                <ul role="list" className="divide-y divide-slate-200">
                    {files.map(file => (
                        <li key={file.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center min-w-0">
                                <Icon icon={getFileIcon(file.mime_type)} className="h-8 w-8 text-slate-400 flex-shrink-0"/>
                                <div className="ml-4 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB - Subido el {formatDate(file.uploaded_at)}</p>
                                </div>
                            </div>
                            <a
                                href={file.url}
                                download={file.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 font-medium text-brand-600 hover:text-brand-500 flex-shrink-0"
                                onClick={(e) => {
                                    if (file.url === '#') {
                                        e.preventDefault();
                                        alert('No hay un archivo real para descargar (simulación).');
                                    }
                                }}
                            >
                                Ver / Descargar
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const PaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
    calculation: PayrollCalculationType;
    simulatedDate: Date;
}> = ({ isOpen, onClose, employee, calculation, simulatedDate }) => {
    const [step, setStep] = useState<'payment' | 'confirmation'>('payment');
    const [isReceiptGenerated, setIsReceiptGenerated] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [proofFileName, setProofFileName] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep('payment');
            setIsReceiptGenerated(false);
            setIsSendingEmail(false);
            setIsEmailSent(false);
            setProofFileName(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProofFileName(e.target.files[0].name);
        }
    };
    
    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Pago de ${formatCurrency(calculation.netPay)} registrado para ${employee.name} (simulación).`);
        setStep('confirmation');
    };

    const handleGenerateReceipt = () => {
        const periodInfo = getCurrentPayrollPeriod(simulatedDate);
        const payslipComponent = <Payslip employee={employee} calculation={calculation} periodInfo={periodInfo} />;
        const payslipHtml = ReactDOMServer.renderToString(payslipComponent);

        const fullHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
            setIsReceiptGenerated(true);
        } else {
            alert('No se pudo abrir la ventana. Por favor, deshabilita el bloqueador de pop-ups.');
        }
    };


    const handleSendEmail = () => {
        setIsSendingEmail(true);
        setTimeout(() => {
            setIsSendingEmail(false);
            setIsEmailSent(true);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                        {step === 'payment' ? 'Registrar Pago de Quincena' : 'Pago Registrado'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100" aria-label="Cerrar modal">
                        <Icon icon={Icons.x} className="w-6 h-6" />
                    </button>
                </div>
                
                {step === 'payment' && (
                    <>
                        <div className="mb-6 text-center">
                            <p className="text-sm text-slate-500">Monto a pagar a <span className="font-bold">{employee.name}</span></p>
                            <p className="text-4xl font-extrabold text-brand-700 mt-1">{formatCurrency(calculation.netPay)}</p>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="space-y-4">
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700">Método de pago</label>
                                <select id="paymentMethod" name="paymentMethod" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md">
                                    <option>Transferencia Bancaria</option>
                                    <option>Efectivo</option>
                                    <option>Otro</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="reference" className="block text-sm font-medium text-slate-700">Referencia</label>
                                <input type="text" name="reference" id="reference" className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" placeholder="Ej. Folio de transferencia" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subir comprobante</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <Icon icon={Icons.upload} className="mx-auto h-10 w-10 text-slate-400" />
                                        <div className="flex text-sm text-slate-600">
                                            <label htmlFor="proof-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none">
                                                <span>Selecciona un archivo</span>
                                                <input id="proof-upload" name="proof-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">o arrástralo aquí</p>
                                        </div>
                                        {proofFileName ? (
                                             <p className="text-xs text-green-600 font-semibold">{proofFileName}</p>
                                        ) : (
                                             <p className="text-xs text-slate-500">PDF, PNG, JPG hasta 10MB</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                 <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                                    Marcar como Pagado y Registrar
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {step === 'confirmation' && (
                    <div className="text-center space-y-6 py-8">
                         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                           <Icon icon={isEmailSent ? Icons.envelope : Icons.check} className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                             {isEmailSent ? '¡Recibo Enviado Exitosamente!' : '¡Pago Registrado Exitosamente!'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {isEmailSent 
                                ? `El recibo de nómina ha sido enviado a ${employee.email}.`
                                : 'Ahora puedes generar el recibo de nómina y enviarlo al empleado.'}
                        </p>
                        
                        {isEmailSent ? (
                            <div className="mt-6">
                                <button
                                    onClick={onClose}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                                >
                                    Finalizar
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                                    <button 
                                        onClick={handleGenerateReceipt}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                                    >
                                        <Icon icon={Icons.documentText} className="w-5 h-5 mr-2" />
                                        Generar Recibo PDF
                                    </button>
                                    <button 
                                        onClick={handleSendEmail}
                                        disabled={!isReceiptGenerated || isSendingEmail}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                    <Icon icon={Icons.envelope} className="w-5 h-5 mr-2" />
                                        {isSendingEmail ? 'Enviando...' : 'Enviar por Correo'}
                                    </button>
                                </div>
                                {!isReceiptGenerated && <p className="text-xs text-slate-500 mt-2">Debes generar el recibo antes de poder enviarlo por correo.</p>}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


interface PayrollSectionProps {
    calculation: PayrollCalculationType;
    onOpenPaymentModal: () => void;
    simulatedDate: Date;
    hasSigned: boolean;
}

const PayrollSection: React.FC<PayrollSectionProps> = ({ calculation, onOpenPaymentModal, simulatedDate, hasSigned }) => {
    const periodInfo = getCurrentPayrollPeriod(simulatedDate);

    return (
        <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-800">Cálculo para el Periodo: {periodInfo.range}</h3>
                    <p className="text-sm text-slate-500">Este es un cálculo simulado basado en el salario y las incidencias del periodo actual.</p>
                </div>
                {hasSigned ? (
                    <span className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full font-semibold text-sm flex-shrink-0">
                        <Icon icon={Icons.checkCircle} className="w-5 h-5" />
                        Recibo Firmado
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full font-semibold text-sm flex-shrink-0">
                        <Icon icon={Icons.exclamationTriangle} className="w-5 h-5" />
                        Pendiente de Firma
                    </span>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Percepciones */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-700 border-b pb-2">Percepciones</h4>
                    <dl className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <dt className="text-slate-600">Salario Base Quincenal</dt>
                            <dd className="font-medium text-slate-800">{formatCurrency(calculation.baseSalary)}</dd>
                        </div>
                        {calculation.earnings.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <dt className="text-slate-600">{item.type} <span className="text-xs text-slate-400">({item.comment})</span></dt>
                                <dd className="font-medium text-green-600">{formatCurrency(item.amount)}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <dt>Total Percepciones</dt>
                        <dd>{formatCurrency(calculation.totalEarnings)}</dd>
                    </div>
                </div>

                {/* Deducciones */}
                <div className="space-y-4">
                     <h4 className="text-lg font-semibold text-slate-700 border-b pb-2">Deducciones</h4>
                    <dl className="space-y-2">
                         <div className="flex justify-between text-sm">
                            <dt className="text-slate-600">ISR (Estimado)</dt>
                            <dd className="font-medium text-slate-800">{formatCurrency(calculation.isrDeduction)}</dd>
                        </div>
                        <div className="flex justify-between text-sm">
                            <dt className="text-slate-600">IMSS (Estimado)</dt>
                            <dd className="font-medium text-slate-800">{formatCurrency(calculation.imssDeduction)}</dd>
                        </div>
                        {calculation.otherDeductions.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <dt className="text-slate-600">{item.type} <span className="text-xs text-slate-400">({item.comment})</span></dt>
                                <dd className="font-medium text-red-600">{formatCurrency(item.amount)}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <dt>Total Deducciones</dt>
                        <dd>{formatCurrency(calculation.totalDeductions)}</dd>
                    </div>
                </div>
            </div>
             <div className="mt-8 pt-4 border-t-2 border-dashed">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                    <div>
                        <h4 className="text-xl font-bold text-blue-800">Neto a Pagar</h4>
                        <p className="text-2xl font-extrabold text-blue-800">{formatCurrency(calculation.netPay)}</p>
                    </div>
                    <button 
                        onClick={onOpenPaymentModal}
                        className="px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                        Pagar Quincena
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditSalaryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentSalary: number;
    onSave: (newSalary: number) => void;
}> = ({ isOpen, onClose, currentSalary, onSave }) => {
    const [salary, setSalary] = useState(currentSalary);

    useEffect(() => {
        setSalary(currentSalary);
    }, [currentSalary, isOpen]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(salary);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Editar Salario</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100"><Icon icon={Icons.x} className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="salary" className="block text-sm font-medium text-slate-700">Salario Bruto Mensual (MXN)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                name="salary"
                                id="salary"
                                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                value={salary}
                                onChange={e => setSalary(Number(e.target.value))}
                                step="100"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddIncidentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (incident: Omit<Incident, 'id' | 'period' | 'employee_id'>) => void;
    employeeDailySalary: number;
    simulatedDate: Date;
}> = ({ isOpen, onClose, onSave, employeeDailySalary, simulatedDate }) => {
    const [type, setType] = useState<IncidentType>(IncidentType.Bonus);
    const [amount, setAmount] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (type === IncidentType.Absence) {
            setAmount(-Math.abs(employeeDailySalary));
        } else {
             setAmount(0);
        }
    }, [type, employeeDailySalary]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type, amount, comment });
        onClose();
    };
    
    const incidentTypes = Object.values(IncidentType);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Agregar Incidencia</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100"><Icon icon={Icons.x} className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo de Incidencia</label>
                        <select id="type" value={type} onChange={e => setType(e.target.value as IncidentType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md">
                           {incidentTypes.map(it => <option key={it} value={it}>{it}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Monto (MXN)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                            disabled={type === IncidentType.Absence}
                            className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md disabled:bg-slate-100"
                        />
                         <p className="mt-1 text-xs text-slate-500">Use valores negativos para deducciones (ej. -500).</p>
                    </div>
                    <div>
                         <label htmlFor="comment" className="block text-sm font-medium text-slate-700">Comentario</label>
                        <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={3} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" required />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">Agregar Incidencia</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const VacationStatCard: React.FC<{ title: string; value: number; unit: string; }> = ({ title, value, unit }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">
            {value} <span className="text-lg font-medium text-slate-600">{unit}</span>
        </p>
    </div>
);

const EditEmployeeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
    onSave: (updatedEmployee: Employee) => void;
}> = ({ isOpen, onClose, employee, onSave }) => {
    const [formData, setFormData] = useState<Employee>(employee);

    useEffect(() => {
        setFormData(employee);
    }, [employee, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, branch_id: parseInt(e.target.value, 10) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl m-4 transform transition-all max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Editar Datos del Empleado</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100" aria-label="Cerrar modal">
                        <Icon icon={Icons.x} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="position" className="block text-sm font-medium text-slate-700">Puesto</label>
                            <input type="text" name="position" id="position" value={formData.position} onChange={handleChange} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="rank" className="block text-sm font-medium text-slate-700">Rango</label>
                            <input type="text" name="rank" id="rank" value={formData.rank} onChange={handleChange} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="branch_id" className="block text-sm font-medium text-slate-700">Sucursal</label>
                            <select name="branch_id" id="branch_id" value={formData.branch_id} onChange={handleBranchChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md">
                                {MOCK_BRANCHES.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Estatus</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md">
                                {Object.values(EmployeeStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="rfc" className="block text-sm font-medium text-slate-700">RFC</label>
                            <input type="text" name="rfc" id="rfc" value={formData.rfc} onChange={handleChange} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="curp" className="block text-sm font-medium text-slate-700">CURP</label>
                            <input type="text" name="curp" id="curp" value={formData.curp} onChange={handleChange} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="nss" className="block text-sm font-medium text-slate-700">NSS</label>
                            <input type="text" name="nss" id="nss" value={formData.nss} onChange={handleChange} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="clabe" className="block text-sm font-medium text-slate-700">CLABE</label>
                            <input type="text" name="clabe" id="clabe" value={formData.clabe} onChange={handleChange} className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                        </div>
                    </div>
                    <div className="pt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

type Tab = 'datos' | 'incidencias' | 'vacaciones' | 'nomina' | 'archivos';

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, onBack, currentUser, onUpdateEmployee, simulatedDate, signedPayslips, incidents, onAddIncident }) => {
    const [activeTab, setActiveTab] = useState<Tab>('datos');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isEditSalaryModalOpen, setIsEditSalaryModalOpen] = useState(false);
    const [isAddIncidentModalOpen, setIsAddIncidentModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [editableEmployee, setEditableEmployee] = useState<Employee>(employee);
    const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(() => MOCK_VACATION_REQUESTS.filter(v => v.employee_id === employee.id));

    useEffect(() => {
        setEditableEmployee(employee);
    }, [employee]);

    const branch = useMemo(() => MOCK_BRANCHES.find(b => b.id === editableEmployee.branch_id), [editableEmployee.branch_id]);

    const handleSaveSalary = (newSalary: number) => {
        const updatedEmployee = { ...editableEmployee, gross_salary: newSalary, daily_salary: newSalary / 30 };
        setEditableEmployee(updatedEmployee);
        onUpdateEmployee(updatedEmployee);
        alert('Salario actualizado exitosamente.');
    };

    const handleSaveEmployeeDetails = (updatedEmployee: Employee) => {
        setEditableEmployee(updatedEmployee);
        onUpdateEmployee(updatedEmployee);
        alert('Datos del empleado actualizados exitosamente.');
    };

    const handleAddIncidentInternal = (newIncident: Omit<Incident, 'id' | 'period' | 'employee_id'>) => {
        onAddIncident(editableEmployee.id, newIncident);
    };

    const handleReviewVacation = (requestId: number, newStatus: VacationRequestStatus) => {
        setVacationRequests(prev => prev.map(req => 
            req.id === requestId 
            ? { ...req, status: newStatus, reviewed_by: currentUser.name, reviewed_at: new Date().toISOString() } 
            : req
        ));
        alert(`Solicitud ${newStatus.toLowerCase()} (simulación).`);
    };

    const vacationStats = useMemo(() => {
        const yearsOfService = calculateYearsOfService(employee.hire_date, simulatedDate);
        const accruedDays = getVacationDaysAccrued(yearsOfService);
        const daysTaken = vacationRequests
            .filter(r => r.status === VacationRequestStatus.Approved)
            .reduce((acc, r) => acc + r.days_requested, 0);
        const availableDays = accruedDays - daysTaken;
        return { yearsOfService, accruedDays, daysTaken, availableDays };
    }, [employee.hire_date, vacationRequests, simulatedDate]);

    const payrollCalculation = useMemo(() => {
        return calculatePayroll(editableEmployee, incidents, simulatedDate);
    }, [editableEmployee, incidents, simulatedDate]);
    
    const getStatusBadgeColor = (status: VacationRequestStatus) => {
        switch (status) {
            case VacationRequestStatus.Approved: return 'bg-green-100 text-green-800';
            case VacationRequestStatus.Pending: return 'bg-yellow-100 text-yellow-800';
            case VacationRequestStatus.Rejected: return 'bg-red-100 text-red-800';
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'datos':
                return (
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <DetailItem label="Nombre Completo" value={editableEmployee.name} />
                        <DetailItem label="Correo Electrónico" value={editableEmployee.email} />
                        <DetailItem label="Puesto" value={editableEmployee.position} />
                        <DetailItem label="Sucursal" value={branch?.name || 'N/A'} />
                        <DetailItem label="Rango" value={editableEmployee.rank} />
                        <DetailItem label="Salario Bruto Mensual" value={formatCurrency(editableEmployee.gross_salary)}>
                           {currentUser.role === 'super_admin' && (
                                <button onClick={() => setIsEditSalaryModalOpen(true)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-brand-600">
                                    <Icon icon={Icons.pencil} className="w-4 h-4" />
                                </button>
                           )}
                        </DetailItem>
                        <DetailItem label="Salario Diario" value={formatCurrency(editableEmployee.daily_salary)} />
                        <DetailItem label="RFC" value={mask(editableEmployee.rfc, 4)} />
                        <DetailItem label="CURP" value={mask(editableEmployee.curp, 4)} />
                        <DetailItem label="NSS" value={mask(editableEmployee.nss, 4)} />
                        <DetailItem label="CLABE" value={mask(editableEmployee.clabe, 4)} />
                        <DetailItem label="Fecha de Ingreso" value={formatDate(editableEmployee.hire_date)} />
                    </dl>
                );
            case 'incidencias': {
                const periodIdentifier = getCurrentPayrollPeriodIdentifier(simulatedDate);
                const currentPeriodIncidents = incidents.filter(i => i.employee_id === employee.id && i.period === periodIdentifier);
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Incidencias del Periodo Actual</h3>
                             {currentUser.role === 'super_admin' && (
                                <button onClick={() => setIsAddIncidentModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">
                                    <Icon icon={Icons.plusCircle} className="w-5 h-5 mr-2" />
                                    Agregar Incidencia
                                </button>
                            )}
                        </div>
                        {currentPeriodIncidents.length > 0 ? (
                            <ul className="divide-y divide-slate-200 border rounded-lg">
                                {currentPeriodIncidents.map(inc => (
                                    <li key={inc.id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className={`font-semibold ${inc.amount > 0 ? 'text-green-700' : 'text-red-700'}`}>{inc.type}</p>
                                            <p className="text-sm text-slate-500">{inc.comment}</p>
                                        </div>
                                        <p className={`text-lg font-bold ${inc.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(inc.amount)}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <p className="text-slate-500">No hay incidencias registradas para este periodo.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'vacaciones':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <VacationStatCard title="Días por Ley (Anual)" value={vacationStats.accruedDays} unit="días" />
                            <VacationStatCard title="Días Tomados" value={vacationStats.daysTaken} unit="días" />
                            <VacationStatCard title="Días Disponibles" value={vacationStats.availableDays} unit="días" />
                        </div>
                        <p className="text-sm text-center text-slate-500">
                            El empleado tiene {vacationStats.yearsOfService} años de servicio completados. 
                            Los días por ley corresponden al periodo de aniversario actual.
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t">
                            <h3 className="text-lg font-semibold text-slate-800">Historial de Solicitudes</h3>
                            <button onClick={() => alert('Abrir modal de solicitud de vacaciones')} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700">
                                <Icon icon={Icons.plusCircle} className="w-5 h-5 mr-2" />
                                Solicitar Vacaciones
                            </button>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Periodo Solicitado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Días</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {vacationRequests.map(req => (
                                        <tr key={req.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">{formatDate(req.start_date)} - {formatDate(req.end_date)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{req.days_requested}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(req.status)}`}>{req.status}</span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                {req.status === VacationRequestStatus.Pending && currentUser.role !== 'empleado' ? (
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleReviewVacation(req.id, VacationRequestStatus.Approved)} className="text-green-600 hover:text-green-900">Aprobar</button>
                                                        <button onClick={() => handleReviewVacation(req.id, VacationRequestStatus.Rejected)} className="text-red-600 hover:text-red-900">Rechazar</button>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         {vacationRequests.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <p className="text-slate-500">No hay solicitudes de vacaciones registradas.</p>
                            </div>
                        )}
                    </div>
                );
            case 'archivos':
                return <FilesSection employeeId={editableEmployee.id} />;
            case 'nomina': {
                const periodIdentifier = getCurrentPayrollPeriodIdentifier(simulatedDate);
                const hasSigned = signedPayslips[periodIdentifier]?.includes(employee.id) ?? false;
                return <PayrollSection calculation={payrollCalculation} onOpenPaymentModal={() => setIsPaymentModalOpen(true)} simulatedDate={simulatedDate} hasSigned={hasSigned} />;
            }
            default:
                return <div className="text-slate-500">Contenido para '{activeTab}' no disponible aún.</div>;
        }
    };
    
    const tabs: {id: Tab, label: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>>}[] = [
        {id: 'datos', label: 'Datos', icon: Icons.users },
        {id: 'incidencias', label: 'Incidencias', icon: Icons.exclamationTriangle},
        {id: 'vacaciones', label: 'Vacaciones', icon: Icons.sun},
        {id: 'nomina', label: 'Nómina', icon: Icons.cash},
        {id: 'archivos', label: 'Archivos', icon: Icons.file},
    ];

    return (
        <>
            <div className="p-8 space-y-6">
                <button onClick={onBack} className={`flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 ${currentUser.role === 'empleado' ? 'hidden' : ''}`}>
                    <Icon icon={Icons.arrowLeft} className="w-5 h-5 mr-2"/>
                    Volver a la lista
                </button>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between space-x-6">
                    <div className="flex items-center space-x-6">
                        <img src={editableEmployee.avatarUrl} alt={editableEmployee.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-white" />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{editableEmployee.name}</h2>
                            <p className="text-lg text-slate-600">{editableEmployee.position}</p>
                            <p className="text-sm text-slate-400">{editableEmployee.external_id}</p>
                        </div>
                    </div>
                     {currentUser.role === 'super_admin' && (
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                            <Icon icon={Icons.pencil} className="w-4 h-4 mr-2" />
                            Editar Empleado
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                >
                                    <Icon icon={tab.icon} className={`w-5 h-5 mr-2 ${activeTab === tab.id && (tab.id === 'incidencias' ? 'text-yellow-500' : (tab.id === 'vacaciones' ? 'text-yellow-500' : ''))}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                employee={editableEmployee}
                calculation={payrollCalculation}
                simulatedDate={simulatedDate}
            />
            <EditSalaryModal 
                isOpen={isEditSalaryModalOpen}
                onClose={() => setIsEditSalaryModalOpen(false)}
                currentSalary={editableEmployee.gross_salary}
                onSave={handleSaveSalary}
            />
            <AddIncidentModal
                isOpen={isAddIncidentModalOpen}
                onClose={() => setIsAddIncidentModalOpen(false)}
                onSave={handleAddIncidentInternal}
                employeeDailySalary={editableEmployee.daily_salary}
                simulatedDate={simulatedDate}
            />
            <EditEmployeeModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                employee={editableEmployee}
                onSave={handleSaveEmployeeDetails}
            />
        </>
    );
};