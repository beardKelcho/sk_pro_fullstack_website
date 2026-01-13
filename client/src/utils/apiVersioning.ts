import { NextRequest, NextResponse } from 'next/server';

interface ApiVersion {
  version: string;
  handler: (request: NextRequest) => Promise<NextResponse>;
  deprecated?: boolean;
  sunsetDate?: Date;
}

export class ApiVersioning {
  private static instance: ApiVersioning;
  private versions: Map<string, ApiVersion> = new Map();
  private defaultVersion: string = 'v1';

  private constructor() {}

  static getInstance(): ApiVersioning {
    if (!ApiVersioning.instance) {
      ApiVersioning.instance = new ApiVersioning();
    }
    return ApiVersioning.instance;
  }

  registerVersion(version: string, handler: (request: NextRequest) => Promise<NextResponse>, options: {
    deprecated?: boolean;
    sunsetDate?: Date;
  } = {}) {
    this.versions.set(version, {
      version,
      handler,
      ...options
    });
  }

  setDefaultVersion(version: string) {
    if (this.versions.has(version)) {
      this.defaultVersion = version;
    }
  }

  async handleRequest(request: NextRequest): Promise<NextResponse> {
    const version = this.getVersionFromRequest(request);
    const apiVersion = this.versions.get(version);

    if (!apiVersion) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: {
          message: `API version ${version} not found`,
          code: 'VERSION_NOT_FOUND'
        }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Deprecated kontrolü
    if (apiVersion.deprecated) {
      const response = await apiVersion.handler(request);
      
      // Deprecated header'ı ekle
      response.headers.set('Warning', `299 - "API version ${version} is deprecated"`);
      
      // Sunset date varsa header'a ekle
      if (apiVersion.sunsetDate) {
        response.headers.set('Sunset', apiVersion.sunsetDate.toISOString());
      }

      return response;
    }

    return apiVersion.handler(request);
  }

  private getVersionFromRequest(request: NextRequest): string {
    // URL'den versiyon kontrolü (/api/v1/...)
    const pathSegments = request.nextUrl.pathname.split('/');
    const versionIndex = pathSegments.indexOf('api') + 1;
    
    if (versionIndex < pathSegments.length && pathSegments[versionIndex].startsWith('v')) {
      return pathSegments[versionIndex];
    }

    // Header'dan versiyon kontrolü
    const acceptHeader = request.headers.get('Accept');
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/version=(\d+)/);
      if (versionMatch) {
        return `v${versionMatch[1]}`;
      }
    }

    // Query parametresinden versiyon kontrolü
    const versionParam = request.nextUrl.searchParams.get('version');
    if (versionParam) {
      return `v${versionParam}`;
    }

    return this.defaultVersion;
  }

  getAvailableVersions(): string[] {
    return Array.from(this.versions.keys());
  }

  getVersionInfo(version: string): {
    version: string;
    deprecated: boolean;
    sunsetDate?: Date;
  } | null {
    const apiVersion = this.versions.get(version);
    if (!apiVersion) return null;

    return {
      version: apiVersion.version,
      deprecated: apiVersion.deprecated ?? false,
      sunsetDate: apiVersion.sunsetDate
    };
  }

  // API versiyon bilgilerini döndüren endpoint
  async getVersionInfoResponse(): Promise<NextResponse> {
    const versions = this.getAvailableVersions().map(version => 
      this.getVersionInfo(version)
    ).filter(Boolean);

    return new NextResponse(JSON.stringify({
      success: true,
      data: {
        versions,
        defaultVersion: this.defaultVersion,
        currentTime: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 