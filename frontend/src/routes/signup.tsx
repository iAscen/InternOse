import type { Route } from "./+types/signup";
import { useState } from "react";
import { SignupTypeSelector, EmployerForm, StudentForm } from "../components/signup";
import PageLayout from "../components/PageLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inscription - InternOSE" },
    { name: "description", content: "Créez votre compte employeur ou étudiant" },
  ];
}

type AccountType = 'employer' | 'student';

export default function Signup() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const handleSelectEmployer = () => setAccountType('employer');
  const handleSelectStudent = () => setAccountType('student');
  const handleBack = () => setAccountType(null);

  if (!accountType) {
    return (
      <PageLayout>
        <SignupTypeSelector 
          onSelectEmployer={handleSelectEmployer}
          onSelectStudent={handleSelectStudent}
        />
      </PageLayout>
    );
  }

  if (accountType === 'employer') {
    return (
      <PageLayout>
        <EmployerForm onBack={handleBack} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <StudentForm onBack={handleBack} />
    </PageLayout>
  );
}
