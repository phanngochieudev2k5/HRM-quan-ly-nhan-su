export const getDefaultPathForRole = (role) => {
    switch (role) {
        case 'Admin':
            return '/admin/dashboard';
        case 'Manager':
            return '/manager/dashboard';
        case 'Employee':
            return '/employee/dashboard';
        case 'Finance':
            return '/finance/dashboard';
        case 'HR':
        default:
            return '/hr/dashboard';
    }
};

export const moduleToPath = (module, subModule = null) => {
    switch (module) {
        // Admin
        case 'admin-dashboard':
            return '/admin/dashboard';
        case 'admin-accounts':
            return '/admin/accounts';
        case 'admin-logs':
            return '/admin/logs';
        case 'admin-settings':
            return '/admin/settings';

        // Manager
        case 'manager-dashboard':
            return '/manager/dashboard';
        case 'manager-team':
            return '/manager/team';
        case 'manager-leaves':
            return '/manager/leaves';
        case 'manager-overtime':
            return '/manager/overtime';
        case 'manager-performance':
            return '/manager/performance';

        // Employee
        case 'employee-dashboard':
            return '/employee/dashboard';
        case 'employee-profile':
            return '/employee/profile';
        case 'employee-checkin':
            return '/employee/checkin';
        case 'employee-attendance':
            return '/employee/attendance';
        case 'employee-leave':
            return '/employee/leave';
        case 'employee-overtime':
            return '/employee/overtime';
        case 'employee-payslip':
            return '/employee/payslip';
        case 'employee-training':
            return '/employee/training';

        // Finance
        case 'finance-dashboard':
            return '/finance/dashboard';
        case 'finance-calc':
            return '/finance/calc';
        case 'finance-components':
            return '/finance/components';
        case 'finance-reports':
            return '/finance/reports';

        // HR
        case 'hr-dashboard':
            return '/hr/dashboard';
        case 'hr-employees':
            return subModule
                ? `/hr/employees/${subModule}`
                : '/hr/employees/list';
        case 'hr-attendance':
            return subModule
                ? `/hr/attendance/${subModule}`
                : '/hr/attendance/history';
        case 'hr-recruitment':
            return subModule
                ? `/hr/recruitment/${subModule}`
                : '/hr/recruitment/jobs';
        case 'hr-leave':
            return '/hr/leave';
        case 'hr-overtime':
            return '/hr/overtime';
        case 'hr-assets':
            return '/hr/assets';
        case 'hr-reports':
            return '/hr/reports';

        default:
            if (typeof module === 'string' && module.startsWith('/')) {
                return module;
            }
            return '/';
    }
};

export const pathToModule = (pathname) => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) {
        return { module: null, subModule: null };
    }

    const [role, section, sub] = parts;

    if (role === 'admin') {
        return {
            module: section ? `admin-${section}` : 'admin-dashboard',
            subModule: sub || null,
        };
    }

    if (role === 'manager') {
        return {
            module: section ? `manager-${section}` : 'manager-dashboard',
            subModule: sub || null,
        };
    }

    if (role === 'employee') {
        return {
            module: section ? `employee-${section}` : 'employee-dashboard',
            subModule: sub || null,
        };
    }

    if (role === 'finance') {
        return {
            module: section ? `finance-${section}` : 'finance-dashboard',
            subModule: sub || null,
        };
    }

    if (role === 'hr') {
        const sec = section || 'dashboard';
        let resolvedSub = sub || null;
        if (!resolvedSub) {
            if (sec === 'employees') resolvedSub = 'list';
            else if (sec === 'attendance') resolvedSub = 'history';
            else if (sec === 'recruitment') resolvedSub = 'jobs';
        }
        return {
            module: `hr-${sec}`,
            subModule: resolvedSub,
        };
    }

    return { module: null, subModule: null };
};
