
import React from 'react';
import { UserRole } from '@/types/auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserCog, Building, UserCircle } from 'lucide-react';

interface RegisterTypeSelectorProps {
  selectedType: UserRole;
  onSelectType: (type: UserRole) => void;
}

const RegisterTypeSelector: React.FC<RegisterTypeSelectorProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="mb-4">
      <p className="mb-2 font-medium text-sm">I am registering as a:</p>
      <RadioGroup 
        defaultValue={selectedType}
        value={selectedType} 
        onValueChange={(value: string) => onSelectType(value as UserRole)} 
        className="grid grid-cols-3 gap-2"
      >
        <Label
          htmlFor="user"
          className={`flex flex-col items-center justify-between rounded-md border-2 p-3 cursor-pointer ${selectedType === 'User' ? 'border-primary' : 'border-muted hover:border-muted-foreground/50'}`}
        >
          <RadioGroupItem value="User" id="user" className="sr-only" />
          <UserCircle className="h-5 w-5 mb-1" />
          <span className="text-xs sm:text-sm">User</span>
        </Label>

        <Label
          htmlFor="business"
          className={`flex flex-col items-center justify-between rounded-md border-2 p-3 cursor-pointer ${selectedType === 'Business' ? 'border-primary' : 'border-muted hover:border-muted-foreground/50'}`}
        >
          <RadioGroupItem value="Business" id="business" className="sr-only" />
          <Building className="h-5 w-5 mb-1" />
          <span className="text-xs sm:text-sm">Business</span>
        </Label>

        <Label
          htmlFor="influencer"
          className={`flex flex-col items-center justify-between rounded-md border-2 p-3 cursor-pointer ${selectedType === 'Influencer' ? 'border-primary' : 'border-muted hover:border-muted-foreground/50'}`}
        >
          <RadioGroupItem value="Influencer" id="influencer" className="sr-only" />
          <UserCog className="h-5 w-5 mb-1" />
          <span className="text-xs sm:text-sm">Influencer</span>
        </Label>
      </RadioGroup>
    </div>
  );
};

export default RegisterTypeSelector;
