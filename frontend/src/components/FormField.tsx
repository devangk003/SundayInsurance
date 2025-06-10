import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id?: string;
  label: string;
  name?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className,
}) => {
  return (    <div className="space-y-2">
      <Label htmlFor={id || name} className="text-sm font-medium text-white drop-shadow-md">
        {label}
        {required && <span className="text-red-300 ml-1">*</span>}
      </Label>
      <Input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full ${className || ''}`}
      />
    </div>
  );
};

export default FormField;