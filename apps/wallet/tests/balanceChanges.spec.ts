// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from './fixtures';
import { createWallet } from './utils/auth';
import {
    generateAddress,
    generateKeypairFromMnemonic,
    requestingSuiFromFaucet,
} from './utils/localnet';

const receivedAddressMnemonic = [
    'beef',
    'beef',
    'beef',
    'beef',
    'beef',
    'beef',
    'beef',
    'beef',
    'beef',
    'beef',
    'beef',
    'beef',
];

const COIN_TO_SEND = 20;

test('request SUI from local faucet', async ({ page, extensionUrl }) => {
    await createWallet(page, extensionUrl);

    await expect(page.getByTestId('coin-balance')).toHaveText('0SUI');
    await page.getByTestId('faucet-request-button').click();
    await expect(page.getByText(/1,000 SUI Received/i)).toBeVisible();
    await expect(page.getByTestId('coin-balance')).toHaveText('1,000SUI');
});

test('send 500 SUI to an address', async ({ page, extensionUrl }) => {
    const keypair = await generateKeypairFromMnemonic(
        receivedAddressMnemonic.join(' ')
    );
    const address = generateAddress(keypair);

    await createWallet(page, extensionUrl);

    await page.getByTestId('copy-address').click();

    const existingAddress = (await page.evaluate(
        'navigator.clipboard.readText()'
    )) as string;

    await requestingSuiFromFaucet(existingAddress);
    await expect(page.getByTestId('coin-balance')).not.toHaveText('0SUI');

    const balance = await page.getByTestId('coin-balance').textContent();
    const finalBalance = Number(balance?.replace(/\D/g, '')) - COIN_TO_SEND;

    await page.getByTestId('send-coin-button').click();
    await page.getByTestId('coin-amount-input').fill(String(COIN_TO_SEND));
    await page.getByTestId('address-input').fill(address);
    await page.getByRole('button', { name: 'Review' }).click();
    await page.getByRole('button', { name: 'Send Now' }).click();
    await expect(page.getByTestId('overlay-title')).toHaveText('Transaction');

    await page.getByTestId('close-icon').click();
    await page.getByTestId('nav-tokens').click();
    await expect(page.getByTestId('coin-balance')).toHaveText(
        `${finalBalance.toLocaleString()}SUI`
    );

    await page.getByTestId('nav-activity').click();
    await page
        .getByText(/Transaction/i)
        .first()
        .click();
    await expect(page.getByText(`Amount+${COIN_TO_SEND} SUI`)).toBeVisible();
});
