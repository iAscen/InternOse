import { useState, useEffect } from 'react';
import { useI18nReady } from '~/hooks';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  waitForI18n?: boolean;
}

/**
 * Composant qui ne rend ses enfants que côté client
 * Utile pour éviter les erreurs d'hydratation avec des composants
 * qui dépendent de l'état du navigateur ou de données asynchrones
 */
export default function ClientOnly({ 
  children, 
  fallback = null, 
  waitForI18n = false 
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const isI18nReady = useI18nReady();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Si on attend i18n et qu'il n'est pas prêt, afficher le fallback
  if (waitForI18n && !isI18nReady) {
    return <>{fallback}</>;
  }

  // Si on n'a pas encore monté le composant côté client
  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
