import { useTranslation } from "react-i18next";
import type { InternshipContract, Professor } from "~/interfaces";
import { internshipManagerAPI } from "~/services/InternshipManagerAPI";

interface ProfessorListModalProps {
    professors: Professor[],
    contract: InternshipContract,
    onProfessorUpdate: () => void,
    onClose: () => void
}

export function ProfessorListModal(
    {professors, 
    contract,
    onProfessorUpdate, 
    onClose
    }: ProfessorListModalProps) {
    
    const { t } = useTranslation()

    const handleProfessorUpdate = async (professorId: number) => {
        try {
            const response = await internshipManagerAPI.assignProfessorToContract(contract.id, professorId)

            if (response.success) {
                onClose()
                onProfessorUpdate()
            }

        } catch(err) {
            onClose()
        }
    }

    return <>
        <div
        className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-[100]"
        onClick={onClose}
        >
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 bg-gray-100">
            <h2 className="text-xl p-3 font-semibold bg-gray-200 text-gray-900 mb-4">
              {t('internshipContract.professors')}
            </h2>
            {professors.map((professor) => 
            
                <div onClick={() => {handleProfessorUpdate(professor.id)}} key={professor.id} className="text-gray-900 flex items-center pb-3 ps-3 pe-3">
                    <span>{professor.firstName} {professor.lastName}</span>

                    {professor.id != contract.professorId && <div className="ms-auto">
                        <button className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            {t('internshipContract.assign')}
                        </button>
                    </div>}

                    {contract.professorId == professor.id &&
                        <span className="ms-auto">{t('common.assigned')}</span>
                    }
                </div>
            )}

            { professors.length < 1 &&
                <span className="text-gray-900 pb-3">{t('internshipContract.noProfessorAvailable')}</span>
            }
          </div>
        </div>
    </div>
    </>
}