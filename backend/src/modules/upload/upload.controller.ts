import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/upload')
@UseGuards(AuthGuard)
export class UploadController {
    constructor(private uploadService: UploadService) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
            fileFilter: (req, file, cb) => {
                const allowed = /\.(jpg|jpeg|png|pdf)$/i;
                if (allowed.test(extname(file.originalname))) {
                    cb(null, true);
                } else {
                    cb(new Error('Only .jpg, .jpeg, .png, .pdf files are allowed'), false);
                }
            },
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return {
            filename: file.filename,
            url: this.uploadService.getFileUrl(file.filename),
            size: file.size,
            mimetype: file.mimetype,
        };
    }
}
