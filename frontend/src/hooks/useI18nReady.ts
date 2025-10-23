import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook personnalisé pour vérifier si i18n est prêt
 * Évite les erreurs d'hydratation en attendant que les traductions soient chargées
 */
export function useI18nReady() {
  const { ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ready) {
      setIsReady(true);
    }
  }, [ready]);

  return isReady;
}
