import readline from 'readline';

// Hàm yêu cầu người dùng nhập vào filepath và filename
export const getFileInfo = (
    rl: readline.Interface
): Promise<{ filePath: string; fileName: string }> => {
    return new Promise((resolve) => {
        rl.question('Enter the file path: ', (filePath) => {
            rl.question('Enter the file name: ', (fileName) => {
                resolve({ filePath, fileName });
            });
        });
    });
};

// // Sử dụng hàm để lấy thông tin file
// getFileInfo().then(({ filePath, fileName }) => {
//     console.log(`File path: ${filePath}`);
//     console.log(`File name: ${fileName}`);
// });
