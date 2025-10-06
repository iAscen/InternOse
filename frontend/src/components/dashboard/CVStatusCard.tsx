interface CVStatusCardProps {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  fileName: string | null;
  onStatusChange: (status: 'none' | 'pending' | 'approved' | 'rejected') => void;
}

export default function CVStatusCard({ status, fileName, onStatusChange }: CVStatusCardProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'none':
        return {
          title: 'Aucun CV téléversé',
          description: 'Téléversez votre CV pour commencer à postuler aux offres de stage.',
          icon: (
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-600'
        };
      case 'pending':
        return {
          title: 'CV en attente de validation',
          description: `Votre CV "${fileName}" est en cours de validation par le gestionnaire de stage.`,
          icon: (
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'approved':
        return {
          title: 'CV validé',
          description: `Votre CV "${fileName}" a été validé. Vous pouvez maintenant postuler aux offres de stage.`,
          icon: (
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'rejected':
        return {
          title: 'CV rejeté',
          description: `Votre CV "${fileName}" a été rejeté. Veuillez téléverser une nouvelle version.`,
          icon: (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`rounded-lg border-2 border-dashed ${statusInfo.bgColor} ${statusInfo.borderColor} p-6`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {statusInfo.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${statusInfo.textColor}`}>
            {statusInfo.title}
          </h3>
          <p className={`mt-1 ${statusInfo.textColor}`}>
            {statusInfo.description}
          </p>
        </div>
        {status === 'rejected' && (
          <button
            onClick={() => onStatusChange('none')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Téléverser un nouveau CV
          </button>
        )}
      </div>
    </div>
  );
}
