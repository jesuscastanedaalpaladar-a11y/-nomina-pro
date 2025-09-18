import React, { useState } from 'react';
import { User, Branch } from '../types';
import Icon from '../components/ui/Icon';

interface SettingsPageProps {
    currentUser: User;
    users: User[];
    branches: Branch[];
    onAddUser: (user: Omit<User, 'id'>) => void;
    onUpdateUser: (id: number, user: Partial<User>) => void;
    onDeleteUser: (id: number) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
    currentUser,
    users,
    branches,
    onAddUser,
    onUpdateUser,
    onDeleteUser
}) => {
    const [activeTab, setActiveTab] = useState<'users' | 'general' | 'branches'>('users');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'empleado' as Role,
        assigned_branch_ids: [] as number[],
        employee_id: undefined as number | undefined
    });

    const handleAddUser = () => {
        if (newUser.name && newUser.email) {
            onAddUser({
                ...newUser,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`
            });
            setNewUser({
                name: '',
                email: '',
                role: 'empleado',
                assigned_branch_ids: [],
                employee_id: undefined
            });
            setShowAddUserModal(false);
        }
    };

    const handleUpdateUser = () => {
        if (editingUser) {
            onUpdateUser(editingUser.id, editingUser);
            setEditingUser(null);
        }
    };

    const handleDeleteUser = (userId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            onDeleteUser(userId);
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'super_admin': return 'Super Administrador';
            case 'gerente_sucursal': return 'Gerente de Sucursal';
            case 'empleado': return 'Empleado';
            default: return role;
        }
    };

    const getBranchNames = (branchIds: number[]) => {
        return branchIds.map(id => branches.find(b => b.id === id)?.name || `Sucursal ${id}`).join(', ');
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración del Sistema</h1>
                <p className="text-gray-600">Gestiona usuarios, sucursales y configuraciones generales</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'users'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Icon name="users" className="w-4 h-4 inline mr-2" />
                        Usuarios
                    </button>
                    <button
                        onClick={() => setActiveTab('branches')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'branches'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Icon name="building" className="w-4 h-4 inline mr-2" />
                        Sucursales
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'general'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Icon name="settings" className="w-4 h-4 inline mr-2" />
                        General
                    </button>
                </nav>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <Icon name="plus" className="w-4 h-4 mr-2" />
                            Agregar Usuario
                        </button>
                    </div>

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sucursales Asignadas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    className="h-10 w-10 rounded-full"
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === 'super_admin' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : user.role === 'gerente_sucursal'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.assigned_branch_ids?.length 
                                                ? getBranchNames(user.assigned_branch_ids)
                                                : 'N/A'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Icon name="edit" className="w-4 h-4" />
                                                </button>
                                                {user.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Icon name="trash" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Branches Tab */}
            {activeTab === 'branches' && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Sucursales</h2>
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {branches.map((branch) => (
                                    <tr key={branch.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {branch.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {branch.name}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración General</h2>
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Empresa
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue="Empresa de Nómina Pro"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Período de Nómina
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="quincenal">Quincenal</option>
                                    <option value="mensual">Mensual</option>
                                    <option value="semanal">Semanal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Días de Trabajo por Semana
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue="5"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                    Guardar Configuración
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Usuario</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rol
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="empleado">Empleado</option>
                                        <option value="gerente_sucursal">Gerente de Sucursal</option>
                                        <option value="super_admin">Super Administrador</option>
                                    </select>
                                </div>
                                {newUser.role === 'gerente_sucursal' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sucursales Asignadas
                                        </label>
                                        <div className="space-y-2">
                                            {branches.map((branch) => (
                                                <label key={branch.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={newUser.assigned_branch_ids.includes(branch.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setNewUser({
                                                                    ...newUser,
                                                                    assigned_branch_ids: [...newUser.assigned_branch_ids, branch.id]
                                                                });
                                                            } else {
                                                                setNewUser({
                                                                    ...newUser,
                                                                    assigned_branch_ids: newUser.assigned_branch_ids.filter(id => id !== branch.id)
                                                                });
                                                            }
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    {branch.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowAddUserModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Usuario</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rol
                                    </label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value as Role})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="empleado">Empleado</option>
                                        <option value="gerente_sucursal">Gerente de Sucursal</option>
                                        <option value="super_admin">Super Administrador</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdateUser}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
