import { setAuthCookie, removeAuthCookie } from '@lib/utils/tokenCookieManager';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'accessToken';

jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

describe('authCookies', () => {
    const testToken = 'mocked.jwt.token';

    const mockSet = jest.fn();
    const mockDelete = jest.fn();

    beforeEach(() => {
        mockSet.mockClear();
        mockDelete.mockClear();

        (cookies as jest.Mock).mockResolvedValue({
            set: mockSet,
            delete: mockDelete,
        });
    });

    test('setAuthCookie llama a cookieStore.set con el token', async () => {
        await setAuthCookie(testToken);
        expect(mockSet).toHaveBeenCalledWith(
            COOKIE_NAME,
            testToken,
            expect.any(Object) // No importa las opciones, solo que exista el objeto
        );
    });

    test('removeAuthCookie llama a cookieStore.delete con el nombre de la cookie', async () => {
        await removeAuthCookie();
        expect(mockDelete).toHaveBeenCalledWith(COOKIE_NAME);
    });
});