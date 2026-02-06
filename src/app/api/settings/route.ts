import { NextRequest } from 'next/server';

let settingsDb = {
    storeName: 'StoreOps',
};

export async function GET() {
    return Response.json(settingsDb);
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const storeName = (body?.storeName ?? '').trim();

    if (!storeName) return Response.json({ error: 'invalid' }, { status: 400 });

    settingsDb = { ...settingsDb, storeName };
    return Response.json(settingsDb);
}
