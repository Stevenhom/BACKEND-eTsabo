import { Op } from 'sequelize';

export function stripSeconds(dateInput) {
  const date = new Date(dateInput);
  date.setSeconds(0, 0);
  return date;
}

export function buildSequelizeWhere(filters, modelAttributes) {
  const where = {};

  for (const field in filters) {
    const conditions = filters[field];
    if (!Array.isArray(conditions) || conditions.length === 0) continue;

    const { value, matchMode } = conditions[0];
    if (value === null || value === undefined || value === '') continue;

    if (!modelAttributes[field]) {
      console.warn(`Champ inconnu dans le modèle : ${field} — ignoré`);
      continue;
    }

    switch (matchMode) {
      case 'startsWith':
        where[field] = { [Op.iLike]: `${value}%` };
        break;
      case 'contains':
        where[field] = { [Op.iLike]: `%${value}%` };
        break;
      case 'endsWith':
        where[field] = { [Op.iLike]: `%${value}` };
        break;
      case 'equals':
        where[field] = value;
        break;
      case 'dateIs':
        where[field] = { [Op.eq]: new Date(value) };
        break;
      default:
        console.warn(`MatchMode non géré : ${matchMode}`);
    }
  }

  return where;
}
