# Résolution des Conflits de Merge - EQ6-62 ← main

## Date: 2025-10-21

## Fichiers en conflit (12):
1. ✅ InternOSEApplication.java
2. ✅ StudentApplicationDAO.java
3. ✅ GlobalExceptionManager.java
4. ✅ StudentController.java
5. ✅ Paths.java
6. ✅ InternshipManagerService.java
7. ✅ StudentService.java
8. ✅ UserService.java (anciennement AuthService)
9. ✅ UserAlreadyExistsException.java (supprimé dans EQ6-62, modifié dans main)
10. ✅ StudentControllerTests.java
11. ✅ StudentServiceTests.java
12. ✅ UserServiceTest.java

## Changements principaux dans main:
- Renommage: CV → Resume
- Renommage: DocumentStatus → VerificationStatus
- Renommage: AuthService → UserService
- Refactoring des exceptions
- Suppression de code smells

## Changements dans EQ6-62:
- Ajout de la fonctionnalité de postulation aux offres de stage
- Validation du statut du CV avant postulation
- Nouvelles exceptions: AlreadyExistsException, DocumentNotValidatedException

## Stratégie de résolution:
1. Adopter les noms refactorisés de main
2. Conserver la logique de postulation de EQ6-62
3. Fusionner les exceptions appropriées
4. Maintenir les deux fonctionnalités

