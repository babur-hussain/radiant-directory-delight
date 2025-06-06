
import React from 'react';
import OptimizedRegistrationForm from './OptimizedRegistrationForm';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = (props) => {
  return <OptimizedRegistrationForm {...props} />;
};

export default RegistrationForm;
