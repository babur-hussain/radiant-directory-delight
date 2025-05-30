
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StaffFieldsProps {
  formData: any;
  onChange: (field: string, value: string) => void;
}

const StaffFields: React.FC<StaffFieldsProps> = ({ formData, onChange }) => {
  const staffRoles = [
    'Marketing Manager', 'Content Creator', 'Business Development', 
    'Customer Support', 'Sales Representative', 'Operations', 'Other'
  ];

  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h4 className="font-medium text-green-600">Staff Information</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Staff Role</Label>
          <Select value={formData.staffRole || ''} onValueChange={(value) => onChange('staffRole', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {staffRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="employeeCode">Employee Code</Label>
          <Input
            id="employeeCode"
            placeholder="Your employee code"
            value={formData.employeeCode || ''}
            onChange={(e) => onChange('employeeCode', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default StaffFields;
