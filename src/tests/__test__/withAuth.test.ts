// src/tests/__test__/withAuth.test.ts

// 🔹 Mock primero, antes de importar nada de next/server
jest.mock('next/server', () => {
    return {
        NextRequest: class {
            cookies = {
                get: jest.fn(),
                getAll: jest.fn(),
                has: jest.fn(),
                set: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn(),
                size: 1,
                [Symbol.iterator]: jest.fn(),
            };
        },
        NextResponse: {
            json: jest.fn((body: unknown, init?: ResponseInit) => {
                return {
                    status: init?.status || 200,
                    json: () => Promise.resolve(body),
                };
            }),
        },
    };
});

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@lib/middleware/withAuth';
import * as tokenManagment from '@lib/utils/tokenManagment';
import { errors } from '@shared/errors/errors';

const { AuthorizationError, CredentialsError } = errors;

describe('withAuth middleware', () => {
    const handlerMock = jest.fn();

    function createReqWithCookie(token?: string): Partial<NextRequest> {
        return {
            cookies: {
                get: jest.fn().mockImplementation((name: string) => {
                    if (name === 'accessToken' && token) {
                        return { value: token };
                    }
                    return undefined;
                }),
                getAll: jest.fn(),
                has: jest.fn(),
                set: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn(),
                size: 1,
                [Symbol.iterator]: jest.fn(),
            } as unknown as NextRequest['cookies'],
        };
    }

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    afterAll(() => {
        jest.resetModules(); // limpia mocks de módulos
    });

    test('responde 401 si no hay token', async () => {
        const req = createReqWithCookie();

        const wrapped = withAuth(handlerMock);
        const res = await wrapped(req as NextRequest);

        expect(res.status).toBe(401);
        expect(await res.json()).toMatchObject({
            error: AuthorizationError.name,
            message: 'Falta el token de autenticación',
        });
        expect(handlerMock).not.toHaveBeenCalled();
    });

    test('responde 401 si token inválido (throw CredentialsError)', async () => {
        const token = 'token-fake';
        const req = createReqWithCookie(token);

        jest.spyOn(tokenManagment, 'verifyToken').mockImplementation(() => {
            throw new CredentialsError('Token inválido: falta el ID');
        });

        const wrapped = withAuth(handlerMock);
        const res = await wrapped(req as NextRequest);

        expect(res.status).toBe(401);
        expect(await res.json()).toMatchObject({
            error: CredentialsError.name,
            message: 'Token inválido: falta el ID',
        });
        expect(handlerMock).not.toHaveBeenCalled();
    });

    test('ejecuta handler y devuelve respuesta si token válido', async () => {
        const token = 'token-valido';
        const req = createReqWithCookie(token);

        jest.spyOn(tokenManagment, 'verifyToken').mockReturnValue({ id: 'admin123' });

        handlerMock.mockResolvedValue(NextResponse.json({ success: true }));

        const wrapped = withAuth(handlerMock);
        const res = await wrapped(req as NextRequest);

        expect(handlerMock).toHaveBeenCalledWith(req as NextRequest, { adminId: 'admin123' });
        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({ success: true });
    });
});
