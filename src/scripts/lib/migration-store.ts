import fs from 'fs'
import path from 'path'

export const MIGRATION_DIR = path.resolve(process.cwd(), 'migration')

export function ensureMigrationDir(): void {
  if (!fs.existsSync(MIGRATION_DIR)) {
    fs.mkdirSync(MIGRATION_DIR, { recursive: true })
  }
}

export function migrationPath(filename: string): string {
  return path.join(MIGRATION_DIR, filename)
}

export function readMigrationJson<T = unknown>(filename: string): T {
  const filePath = migrationPath(filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Migration file not found: ${filePath}. Run the pipeline stage that produces it first.`,
    )
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function writeMigrationJson(filename: string, data: unknown): void {
  ensureMigrationDir()
  fs.writeFileSync(migrationPath(filename), JSON.stringify(data, null, 2))
}
