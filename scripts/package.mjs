import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = process.cwd()
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const dist = join(root, 'dist')

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build` first.')
  process.exit(1)
}

const outDir = resolve(process.env.PACKAGE_OUT_DIR ?? join(root, 'release'))
mkdirSync(outDir, { recursive: true })

const date = new Date().toISOString().slice(0, 10)
const archive = join(outDir, `${pkg.name}-${pkg.version}-dist-${date}.tar.gz`)

execFileSync('tar', ['-czf', archive, '-C', dist, '.'], { stdio: 'inherit' })

const bytes = statSync(archive).size
const hash = createHash('sha256').update(readFileSync(archive)).digest('hex')

console.log(`\npackage: ${archive}`)
console.log(`size: ${(bytes / 1024).toFixed(1)} KB`)
console.log(`sha256: ${hash}`)
