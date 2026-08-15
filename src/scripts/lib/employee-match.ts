import type { Employee } from '../../payload-types'

export interface EmployeeMatchCriteria {
  email?: string | null
  name?: string | null
}

/**
 * Matches a legacy record to an existing Employee: by email first, then by `fullName`,
 * then by a `firstName + lastName` concatenation (covers records where `fullName`'s
 * beforeChange hook hasn't run yet). First employee satisfying any criterion wins.
 */
export function findEmployeeMatch(employees: Employee[], criteria: EmployeeMatchCriteria): Employee | undefined {
  const email = criteria.email?.trim().toLowerCase() || null
  const normalizedName = criteria.name?.trim().toLowerCase() || null

  return employees.find((emp) => {
    if (email && emp.email && emp.email.trim().toLowerCase() === email) return true
    if (normalizedName && emp.fullName && emp.fullName.trim().toLowerCase() === normalizedName) return true
    if (normalizedName) {
      const combinedName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim().toLowerCase()
      if (combinedName === normalizedName) return true
    }
    return false
  })
}
