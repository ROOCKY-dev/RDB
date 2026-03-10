import { Project, ProjectSettings } from '../types';
import { generatePostgreSQL } from './postgresql';
import { generateMySQL } from './mysql';
import { generateSQLite } from './sqlite';
import { generateMSSQL } from './mssql';

export function generateSQL(project: Project, dialect?: ProjectSettings['defaultDialect']): string {
  const targetDialect = dialect || project.settings.defaultDialect;

  switch (targetDialect) {
    case 'postgresql':
      return generatePostgreSQL(project);
    case 'mysql':
      return generateMySQL(project);
    case 'sqlite':
      return generateSQLite(project);
    case 'mssql':
      return generateMSSQL(project);
    default:
      return generatePostgreSQL(project);
  }
}
