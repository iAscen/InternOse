import type { InternshipOffer, Cv, InternshipContract } from '~/interfaces';

// Filter internship offers based on criteria
export function filterInternshipOffers(
  offers: InternshipOffer[],
  filters: {
    status?: string;
    program?: string;
    title?: string;
    location?: string;
    company?: string;
    minSalary?: string;
    maxSalary?: string;
    minDuration?: string;
    maxDuration?: string;
    startDateFrom?: string;
    startDateTo?: string;
  }
): InternshipOffer[] {
  return offers.filter(offer => {
    if (filters.status && offer.verificationStatus?.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }

    if (filters.program && offer.program) {
      if (!offer.program.toLowerCase().includes(filters.program.toLowerCase())) {
        return false;
      }
    }

    if (filters.title && offer.title) {
      if (!offer.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }
    }

    if (filters.location && offer.address) {
      if (!offer.address.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    // Note: company filtering removed as InternshipOffer doesn't have companyName field
    // if (filters.company && offer.companyName) {
    //   if (!offer.companyName.toLowerCase().includes(filters.company.toLowerCase())) {
    //     return false;
    //   }
    // }

    if (filters.minSalary && offer.salary) {
      if (offer.salary < parseFloat(filters.minSalary)) {
        return false;
      }
    }

    if (filters.maxSalary && offer.salary) {
      if (offer.salary > parseFloat(filters.maxSalary)) {
        return false;
      }
    }

    if (filters.minDuration && offer.duration) {
      if (offer.duration < parseInt(filters.minDuration)) {
        return false;
      }
    }

    if (filters.maxDuration && offer.duration) {
      if (offer.duration > parseInt(filters.maxDuration)) {
        return false;
      }
    }

    if (filters.startDateFrom && offer.startDate) {
      if (new Date(offer.startDate) < new Date(filters.startDateFrom)) {
        return false;
      }
    }

    if (filters.startDateTo && offer.startDate) {
      if (new Date(offer.startDate) > new Date(filters.startDateTo)) {
        return false;
      }
    }

    return true;
  });
}

// Filter CVs based on criteria
export function filterCvs(
  cvs: Cv[],
  filters: {
    status?: string;
    institution?: string;
    program?: string;
  }
): Cv[] {
  return cvs.filter(cv => {
    if (filters.status && cv.cvStatus?.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }

    // Note: institution and program filtering would need these fields in the Cv interface
    // For now, we'll just return all CVs that pass the status filter
    
    return true;
  });
}

// Sort internship offers
export function sortInternshipOffers(
  offers: InternshipOffer[],
  sortBy?: string,
  ascending: boolean = true
): InternshipOffer[] {
  if (!sortBy) return offers;

  const sorted = [...offers];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy.toLowerCase()) {
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'program':
        comparison = (a.program || '').localeCompare(b.program || '');
        break;
      // case 'company':
      //   comparison = (a.companyName || '').localeCompare(b.companyName || '');
      //   break;
      case 'location':
        comparison = (a.address || '').localeCompare(b.address || '');
        break;
      case 'salary':
        comparison = (a.salary || 0) - (b.salary || 0);
        break;
      case 'duration':
        comparison = (a.duration || 0) - (b.duration || 0);
        break;
      case 'startdate':
      case 'start_date':
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case 'status':
      case 'verification_status':
        comparison = (a.verificationStatus || '').localeCompare(b.verificationStatus || '');
        break;
      default:
        comparison = 0;
    }

    return ascending ? comparison : -comparison;
  });

  return sorted;
}

// Sort CVs
export function sortCvs(
  cvs: Cv[],
  sortBy?: string,
  ascending: boolean = true
): Cv[] {
  if (!sortBy) return cvs;

  const sorted = [...cvs];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy.toLowerCase()) {
      case 'name':
      case 'student_name':
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`;
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`;
        comparison = nameA.localeCompare(nameB);
        break;
      case 'email':
        comparison = (a.email || '').localeCompare(b.email || '');
        break;
      case 'status':
      case 'cv_status':
        comparison = (a.cvStatus || '').localeCompare(b.cvStatus || '');
        break;
      case 'uploaded_date':
        const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        comparison = dateA - dateB;
        break;
      default:
        comparison = 0;
    }

    return ascending ? comparison : -comparison;
  });

  return sorted;
}

// Filter contracts based on criteria
export function filterContracts(
  contracts: InternshipContract[],
  filters: {
    status?: string;
    title?: string;
  }
): InternshipContract[] {
  return contracts.filter(contract => {
    if (filters.status) {
      const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
      if (filters.status === 'fullySigned' && !allSigned) {
        return false;
      }
      if (filters.status === 'pendingSignatures' && allSigned) {
        return false;
      }
    }

    if (filters.title && contract.internshipOfferTitle) {
      if (!contract.internshipOfferTitle.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

// Sort contracts
export function sortContracts(
  contracts: InternshipContract[],
  sortBy?: string,
  ascending: boolean = true
): InternshipContract[] {
  if (!sortBy) return contracts;

  const sorted = [...contracts];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy.toLowerCase()) {
      case 'title':
        const titleA = a.internshipOfferTitle || '';
        const titleB = b.internshipOfferTitle || '';
        comparison = titleA.localeCompare(titleB);
        break;
      case 'name':
      case 'student_name':
        const nameA = `${a.studentFirstName || ''} ${a.studentLastName || ''}`.trim();
        const nameB = `${b.studentFirstName || ''} ${b.studentLastName || ''}`.trim();
        comparison = nameA.localeCompare(nameB);
        break;
      case 'company':
      case 'employer':
        const companyA = a.employerCompany || '';
        const companyB = b.employerCompany || '';
        comparison = companyA.localeCompare(companyB);
        break;
      case 'program':
        // Note: program is not in InternshipContract, would need to be added
        comparison = 0;
        break;
      case 'status':
        const allSignedA = a.isSignedStudent && a.isSignedEmployer && a.isSignedInternshipManager;
        const allSignedB = b.isSignedStudent && b.isSignedEmployer && b.isSignedInternshipManager;
        // Fully signed contracts come first (or last depending on ascending)
        comparison = allSignedA === allSignedB ? 0 : (allSignedA ? 1 : -1);
        break;
      case 'startdate':
      case 'start_date':
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        comparison = dateA - dateB;
        break;
      default:
        comparison = 0;
    }

    return ascending ? comparison : -comparison;
  });

  return sorted;
}

// Filter contracts for professor dashboard
export function filterProfessorContracts(
  contracts: InternshipContract[],
  filters: {
    program?: string;
    company?: string;
    status?: string;
  }
): InternshipContract[] {
  return contracts.filter(contract => {
    if (filters.company && contract.employerCompany) {
      if (!contract.employerCompany.toLowerCase().includes(filters.company.toLowerCase())) {
        return false;
      }
    }

    if (filters.status) {
      const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
      if (filters.status === 'fullySigned' && !allSigned) {
        return false;
      }
      if (filters.status === 'pendingSignatures' && allSigned) {
        return false;
      }
    }

    // Note: program filtering would require program field in InternshipContract
    // For now, we skip program filtering

    return true;
  });
}

