'use client'

interface InputBoxProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function InputBox({
  id,
  label,
  type,
  value,
  onChange,
  placeholder
}: InputBoxProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-darkgrey-krnd">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 text-darkgrey-krnd border-b border-gray-300 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-b-green-krnd transition duration:300"
      />
    </div>
  );
}
