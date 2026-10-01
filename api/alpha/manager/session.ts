import { isPlausibleToken } from '../../../server/alpha/tokens.js';
import {
  findManagerAccess,
  getManagerDepartmentOverview,
} from '../../../server/alpha/managerRepository.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { token } = req.body ?? {};

  if (!isPlausibleToken(token)) {
    return res.status(200).json({ valid: false });
  }

  try {
    const manager = await findManagerAccess(token);

    if (!manager) {
      return res.status(200).json({ valid: false });
    }

    const departments = await getManagerDepartmentOverview(manager);

    return res.status(200).json({
      valid: true,
      role: manager.role,
      organization: {
        slug: manager.organizationSlug,
        displayName: manager.organizationDisplayName,
      },
      departmentScope:
        manager.role === 'department_manager'
          ? {
              slug: manager.orgUnitSlug,
              displayName: manager.orgUnitDisplayName,
            }
          : null,
      departments,
    });
  } catch (error) {
    console.error('Alpha manager session error', error);
    return res.status(503).json({ error: 'alpha_service_unavailable' });
  }
}
