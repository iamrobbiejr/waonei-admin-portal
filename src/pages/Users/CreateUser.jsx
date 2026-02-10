import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import {
    UserPlus,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateUser = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/admin/users', {
                email: data.email,
                password: data.password,
                role: data.role
            });

            setStatus({ type: 'success', message: `User ${data.email} created successfully!` });
            reset();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Failed to create user.";
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
                    <p className="text-gray-500">Add a new administrator or reviewer to the system.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                {...register('email', {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                                placeholder="colleague@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                {...register('password', {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                {...register('role')}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                            >
                                <option value="user">User (Reviewer)</option>
                                <option value="admin">Administrator</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Administrators can manage users. Users can only view and manage reports.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <AnimatePresence>
                            {status.message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mb-4 p-4 rounded-lg flex items-center ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                        }`}
                                >
                                    {status.type === 'success' ? <Check className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                                    {status.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUser;
