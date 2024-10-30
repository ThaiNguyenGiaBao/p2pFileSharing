// filePiecesManager.ts

import { readFile } from 'fs/promises'; // Import các hàm từ fs/promises

const filePiecesMap: Map<string, Buffer[]> = new Map();

export const getFilePieces = (fileId: string): Buffer[] | undefined => {
    return filePiecesMap.get(fileId);
};

export const setFilePieces = (fileId: string, pieces: Buffer[]): void => {
    filePiecesMap.set(fileId, pieces);
};

export const updateFilePiece = (
    fileId: string,
    index: number,
    piece: Buffer
): void => {
    const pieces = filePiecesMap.get(fileId);
    if (pieces && index >= 0 && index < pieces.length) {
        pieces[index] = piece;
    }
};

// Hàm chia nhỏ file thành các phần (pieces) và lưu vào Map
export async function loadFilePieces(
    filename: string,
    filePath: string,
    pieceSize: number
) {
    const fileBuffer = await readFile(filePath);
    const pieces: Buffer[] = [];
    for (let i = 0; i < fileBuffer.length; i += pieceSize) {
        pieces.push(fileBuffer.slice(i, i + pieceSize));
    }
    filePiecesMap.set(filename, pieces);
}
