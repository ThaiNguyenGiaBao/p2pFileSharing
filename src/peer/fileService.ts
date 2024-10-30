import readline from 'readline';
import fs from 'fs/promises';
// Hàm yêu cầu người dùng nhập vào filepath và filename
// export const getFileInfo = (
//     rl: readline.Interface
// ): Promise<{ filePath: string; fileName: string }> => {
//     return new Promise((resolve) => {
//         rl.question('Enter the file path: ', (filePath) => {
//             rl.question('Enter the file name: ', (fileName) => {
//                 resolve({ filePath, fileName });
//             });
//         });
//     });
// };

export const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
        // Kiểm tra quyền truy cập file (tức là file có tồn tại và có thể đọc)
        await fs.access(filePath);
        return true;
    } catch (err) {
        // Nếu có lỗi thì file không tồn tại
        return false;
    }
};

// // Sử dụng hàm để lấy thông tin file
// getFileInfo().then(({ filePath, fileName }) => {
//     console.log(`File path: ${filePath}`);
//     console.log(`File name: ${fileName}`);
// });
