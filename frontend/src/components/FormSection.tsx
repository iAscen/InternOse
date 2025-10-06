interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function FormSection({
  title,
  children
}: FormSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
