import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, expect, test } from 'vitest';

import { UserError } from '../../util/user-error.js';
import { startGeneration } from '../start-generation.js';

let dir;

beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'ac-unit-'));
});

afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
});

test('throws a UserError when a file to update is missing', async () => {
    const options = { files: ['README.md'], contributors: [] };

    await expect(startGeneration(options, dir)).rejects.toThrow(UserError);
    await expect(startGeneration(options, dir)).rejects.toThrow(
        "Couldn't find README.md",
    );
});
