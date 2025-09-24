interface InternshipOffer {
  id?: number;
  jobTitle: string;
  taskDescription: string;
  qualifications: string;
  duration: number;
  startDate: string;
  endDate: string;
  salary: number;
  address: string;
  validee?: boolean;
}

interface OfferListProps {
  offers: InternshipOffer[];
  loading: boolean;
}

export default function OfferList({ offers, loading }: OfferListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Mes offres de stage</h2>
        </div>
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Mes offres de stage</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>Aucune offre de stage créée pour le moment.</p>
          <p className="mt-2">Cliquez sur "Créer une offre" pour commencer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Mes offres de stage</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {offers.map((offer, index) => (
          <div key={offer.id || index} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{offer.jobTitle}</h3>
                <p className="text-gray-600 mt-1">{offer.address}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {offer.startDate} - {offer.endDate} ({offer.duration} semaines)
                </p>
                {offer.salary > 0 && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    ${offer.salary}/semaine
                  </p>
                )}
                <div className="mt-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    offer.validee 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {offer.validee ? 'Validée' : 'En attente de validation'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-700">
                <strong>Description :</strong> {offer.taskDescription}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Compétences requises :</strong> {offer.qualifications}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
