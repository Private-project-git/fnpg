import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  error: {
    code?: string;
    message: string;
    details?: any;
  } | null;
  timestamp: string;
  version: string;
}

export function apiSuccess<T>(data: T, message = 'Success', status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    error: null,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
  return NextResponse.json(payload, { status });
}

export function apiError(message: string, errorDetails: any = null, status = 500, code?: string) {
  const payload: ApiResponse = {
    success: false,
    message,
    data: null,
    error: {
      code: code || `ERROR_${status}`,
      message: typeof errorDetails === 'string' ? errorDetails : (errorDetails?.message || message),
      details: errorDetails,
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
  return NextResponse.json(payload, { status });
}
