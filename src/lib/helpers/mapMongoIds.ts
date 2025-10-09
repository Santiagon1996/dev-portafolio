// src/lib/helpers/mapMongoIds.ts
export function mapMongoIds<T extends { _id: unknown }>(docs: T[]): (Omit<T, "_id"> & { id: string })[] {
    return docs.map((doc) => {
        const { _id, ...rest } = doc;
        return { ...rest, id: _id?.toString() } as Omit<T, "_id"> & { id: string };
    });
}