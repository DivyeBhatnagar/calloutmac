import { adminService } from './modules/admin/admin.service';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        const res = await adminService.getAllUsers();
        console.log("Found users length:", res.length);
        if (res.length > 0) {
            console.log("First user:", res[0]);
        }
    } catch (e) {
        console.error("Error:", e);
    }
};
run();
