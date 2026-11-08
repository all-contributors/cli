import {mkdtemp, readdir, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, expect, test} from 'vitest'
import {runCli} from './run-cli.js'

let dir

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'ac-e2e-'))
})

afterEach(async () => {
  await rm(dir, {recursive: true, force: true})
})

test('--help exits 0 and lists the commands', async () => {
  const result = await runCli(['--help'], {cwd: dir})

  expect(result.code).toBe(0)
  expect(result.stdout).toContain('generate')
})

test('--help does not create any files', async () => {
  await runCli(['--help'], {cwd: dir})

  expect(await readdir(dir)).toEqual([])
})
