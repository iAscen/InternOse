import type { Route } from "./+types/home";
import Header from "../components/Header";
import Footer from "../components/Footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "InternOSE - Accueil" },
    { name: "description", content: "Plateforme de stages pour employeurs et étudiants" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Bienvenue sur{" "}
            <span className="text-purple-600">
              InternOSE
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            La plateforme qui connecte les employeurs et les étudiants pour des stages de qualité. 
            Trouvez votre prochain stage ou recrutez les meilleurs talents.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
