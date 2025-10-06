export default function FeatureList() {
  const features = [
    "Consulter les offres de stage disponibles",
    "Postuler aux stages qui vous intéressent", 
    "Suivre l'état de vos candidatures",
    "Gérer votre profil et vos préférences"
  ];

  return (
    <div className="text-left max-w-md mx-auto mb-8">
      <ul className="space-y-3 text-gray-700">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
