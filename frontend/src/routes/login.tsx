import type { Route } from "./+types/signup";
import { useState } from "react";
import { EmployerForm, StudentForm } from "../components/signup";
import PageLayout from "../components/PageLayout";
import LoginForm from "~/components/login/LoginForm";
import ClientOnly from "~/components/ClientOnly";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inscription - InternOSE" },
    { name: "description", content: "Créez votre compte employeur ou étudiant" },
  ];
}

type AccountType = 'employer' | 'student';

export default function Login() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const handleBack = () => setAccountType(null);

  if (!accountType) {
    return (
        <PageLayout>
            <ClientOnly 
              fallback={
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                  <div className="text-center mb-12">
                    <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                    <div className="space-y-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-4">
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              }
              waitForI18n={true}
            >
              <LoginForm onBack={function(): void {
                  throw new Error("Function not implemented.");
              } }></LoginForm>
            </ClientOnly>
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
