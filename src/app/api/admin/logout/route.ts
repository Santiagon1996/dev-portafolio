import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@lib/utils/tokenCookieManager';
import { withErrorHandler } from '@lib/helpers/withErrorHandler';

export const POST = withErrorHandler(async (_req /* eslint-disable-line @typescript-eslint/no-unused-vars */, _params) => {
    await removeAuthCookie();

    return NextResponse.json({ message: 'Sesión cerrada exitosamente' }, { status: 200 });

});
