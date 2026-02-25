import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = join(process.cwd(), 'uploads');
        if (!existsSync(this.uploadDir)) {
            mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    getUploadPath(): string {
        return this.uploadDir;
    }

    getFileUrl(filename: string): string {
        return `/uploads/${filename}`;
    }
}
