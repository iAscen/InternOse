// Service spécialisé pour la gestion des erreurs
export class ErrorService {
  // Erreurs d'authentification
  static getAuthErrorMessage(status: number, message: string): string {
    if (status === 401 || status === 403 || status === 404) {
      if (message.includes('userNotFound') || message.includes('Aucun compte trouvé')) {
        return 'Aucun compte trouvé avec cet email. Vérifiez votre adresse email ou créez un compte.';
      }
      if (message.includes('Incorrect username or password')) {
        return 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
      }
      if (message.includes('token') || message.includes('jwt') || message.includes('Token')) {
        return 'Session expirée. Veuillez vous reconnecter.';
      }
      return 'Email ou mot de passe incorrect.';
    }
    return 'Erreur d\'authentification.';
  }

  // Erreurs d'inscription
  static getRegistrationErrorMessage(status: number, message: string): string {
    if (status === 409) {
      if (message.includes('existe déjà') || message.includes('already exists')) {
        return 'Un compte avec cet email existe déjà. Essayez de vous connecter ou utilisez un autre email.';
      }
      return 'Cet email est déjà utilisé.';
    }
    return 'Erreur lors de l\'inscription.';
  }

  // Erreurs de validation
  static getValidationErrorMessage(status: number, message: string): string {
    if (status === 400) {
      if (message.includes('Le mot de passe doit contenir au moins 8 caractères')) {
        return 'Le mot de passe doit contenir au moins 8 caractères.';
      }
      if (message.includes('Le mot de passe doit contenir au moins une lettre majuscule')) {
        return 'Le mot de passe doit contenir au moins une lettre majuscule.';
      }
      if (message.includes('Le mot de passe doit contenir au moins un chiffre')) {
        return 'Le mot de passe doit contenir au moins un chiffre.';
      }
      if (message.includes('Le mot de passe doit contenir au moins un caractère spécial')) {
        return 'Le mot de passe doit contenir au moins un caractère spécial.';
      }
      if (message.includes('Il y a des champs manquants')) {
        return 'Veuillez remplir tous les champs obligatoires.';
      }
      if (message.includes('champ requis') || message.includes('required')) {
        return 'Veuillez remplir tous les champs obligatoires.';
      }
      return 'Les informations fournies ne sont pas valides.';
    }
    return 'Erreur de validation.';
  }

  // Erreurs serveur
  static getServerErrorMessage(status: number): string {
    if (status >= 500) {
      return 'Une erreur technique s\'est produite. Veuillez réessayer dans quelques instants.';
    }
    return 'Une erreur s\'est produite. Veuillez réessayer.';
  }

  // Méthode principale simplifiée
  static getUserFriendlyMessage(status: number, message: string): string {
    if (status === 401 || status === 403 || status === 404) {
      return this.getAuthErrorMessage(status, message);
    }
    if (status === 409) {
      return this.getRegistrationErrorMessage(status, message);
    }
    if (status === 400) {
      return this.getValidationErrorMessage(status, message);
    }
    if (status >= 500) {
      return this.getServerErrorMessage(status);
    }
    return 'Une erreur s\'est produite. Veuillez réessayer.';
  }
}
