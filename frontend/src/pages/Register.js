import React from 'react';
import { Link } from 'react-router-dom';
import { CubeIcon } from '@heroicons/react/24/outline';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <CubeIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Esta funcionalidad estará disponible próximamente
          </p>
        </div>
        
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;