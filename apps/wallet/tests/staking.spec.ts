// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from './fixtures';
import { createWallet } from './utils/auth';

const TEST_TIMEOUT = 125 * 1000;

test('staking', async ({ page, extensionUrl }) => {
    test.skip(
        process.env.CI !== 'true',
        'Runs only on CI since it takes at least 1 minute to complete'
    );
    test.setTimeout(TEST_TIMEOUT);

    await createWallet(page, extensionUrl);

    await page.getByTestId('faucet-request-button').click();
    await expect(page.getByTestId('coin-balance')).toHaveText('1,000SUI');

    await page.getByTestId('stake-n-earn-button').click();
    await page.getByTestId('validator-list-item').first().click();
    await page.getByTestId('select-validator-cta').click();
    await page.getByTestId('stake-amount-input').fill('100');
    await page.getByRole('button', { name: 'Stake Now' }).click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({
        timeout: TEST_TIMEOUT,
    });
    await expect(page.getByTestId('overlay-title')).toHaveText('Transaction');

    await page.getByTestId('close-icon').click();
    await expect(page.getByText('Currently Staked100 SUI')).toBeVisible();

    await page.getByTestId('stake-n-earn-button').click();
    await expect(page.getByText(/Starts Earning now/i)).toBeVisible({
        timeout: TEST_TIMEOUT,
    });

    await page.getByTestId('stake-card').click();
    await page.getByTestId('unstake-button').click();
    await page.getByRole('button', { name: 'Unstake Now' }).click();
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({
        timeout: TEST_TIMEOUT,
    });

    await page.getByTestId('close-icon').click();
    await expect(page.getByText(/Stake and Earn SUI/i)).toBeVisible();
});
