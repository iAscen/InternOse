export default function InfoSection() {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        À propos de votre compte
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Votre profil</h4>
          <p className="text-sm text-gray-600">
            Votre compte étudiant est actif et prêt. Nous vous notifierons 
            dès que toutes les fonctionnalités seront disponibles.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Support</h4>
          <p className="text-sm text-gray-600">
            Si vous avez des questions, n'hésitez pas à contacter 
            le service de gestion des stages de votre établissement.
          </p>
        </div>
      </div>
    </div>
  );
}
