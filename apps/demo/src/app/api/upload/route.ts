import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 업로드 디렉토리 설정
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// 허용된 이미지 MIME 타입
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
];

// 허용된 파일 MIME 타입
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/gzip',
  'text/plain',
  'text/csv',
  'application/json',
  'application/xml',
  'text/markdown',
];

// 파일 크기 제한 (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// 이미지 크기 제한 (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * 고유 파일명 생성
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9가-힣]/g, '_');
  return `${baseName}_${timestamp}_${random}.${ext}`;
}

/**
 * 업로드 디렉토리 확인 및 생성
 */
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 이미지 또는 파일 필드 확인
    const imageFile = formData.get('image') as File | null;
    const file = formData.get('file') as File | null;
    const uploadFile = imageFile || file;

    if (!uploadFile) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const isImage = imageFile !== null;
    const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

    // MIME 타입 검증
    if (!allowedTypes.includes(uploadFile.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${uploadFile.type}` },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (uploadFile.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB` },
        { status: 400 }
      );
    }

    // 업로드 디렉토리 확인
    await ensureUploadDir();

    // 고유 파일명 생성
    const uniqueFileName = generateUniqueFileName(uploadFile.name);
    const filePath = join(UPLOAD_DIR, uniqueFileName);

    // 파일 저장
    const bytes = await uploadFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL 생성
    const url = `/uploads/${uniqueFileName}`;

    // 응답 반환
    if (isImage) {
      return NextResponse.json({
        url,
        alt: uploadFile.name,
      });
    } else {
      return NextResponse.json({
        url,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        mimeType: uploadFile.type,
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// 지원되는 HTTP 메서드
export async function GET() {
  return NextResponse.json(
    { message: 'Upload API - Use POST to upload files' },
    { status: 200 }
  );
}
