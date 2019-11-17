import { execFileSync } from 'child_process'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const migrationsDir = join('server/_migrations')

const lastMigrationFile = join('server/.config/last-migration')

let lastMigration = ''
try {
    lastMigration = readFileSync(join(lastMigrationFile), 'utf8').trim()
} catch (error) {}

const migrationFiles = readdirSync(migrationsDir).sort()

const lastMigrationIndex = migrationFiles.indexOf(lastMigration)

const newMigrationFiles = migrationFiles.filter(
    (_, i) => lastMigrationIndex < i,
)

for (const f of newMigrationFiles) {
    const path = join(migrationsDir, f)

    execFileSync('yarn', ['ts-node', path], {
        stdio: 'inherit',
    })
}

if (newMigrationFiles.length) {
    writeFileSync(
        lastMigrationFile,
        newMigrationFiles[newMigrationFiles.length - 1],
    )
}

console.log('migration completed')
