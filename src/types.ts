// types.ts

// Định nghĩa kiểu dữ liệu cho Peer
export interface Peer {
    id: string;
    ip: string;
    port: number;
}

// Định nghĩa kiểu dữ liệu cho File
export interface File {
    name: string;
    size: number;
}

// Định nghĩa kiểu dữ liệu cho yêu cầu tải xuống
export interface DownloadRequest {
    action: 'download';
    pieceIndex: number;
}
