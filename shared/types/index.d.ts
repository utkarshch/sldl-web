export type InputType = "search" | "spotify" | "youtube" | "bandcamp" | "musicbrainz" | "soulseek" | "csv" | "list";
export type DownloadMode = "normal" | "album" | "aggregate" | "album-aggregate";
export type JobState = "queued" | "running" | "completed" | "failed" | "cancelled";
export interface JobProgress {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
    currentTrack?: string;
}
export interface Job {
    id: string;
    input: string;
    inputType: InputType;
    downloadMode: DownloadMode;
    flags: Record<string, string | boolean | number>;
    state: JobState;
    progress: JobProgress;
    output: string[];
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
}
export interface JobSummary {
    id: string;
    input: string;
    inputType: InputType;
    downloadMode: DownloadMode;
    state: JobState;
    progress: JobProgress;
    createdAt: string;
}
export type ParsedEvent = {
    type: "searching";
    track: string;
} | {
    type: "found";
    track: string;
    user: string;
    file: string;
} | {
    type: "downloading";
    track: string;
    progress: number;
    speed?: string;
} | {
    type: "completed";
    track: string;
    path: string;
} | {
    type: "failed";
    track: string;
    reason: string;
} | {
    type: "skipped";
    track: string;
    reason: string;
} | {
    type: "summary";
    succeeded: number;
    failed: number;
} | {
    type: "info";
    message: string;
} | {
    type: "raw";
    line: string;
};
export interface WsJobOutput {
    jobId: string;
    line: string;
    parsed?: ParsedEvent;
    timestamp: number;
}
export interface WsJobState {
    jobId: string;
    state: JobState;
    progress: JobProgress;
}
export interface WsJobExit {
    jobId: string;
    exitCode: number;
    summary: {
        succeeded: number;
        failed: number;
    };
}
export interface WsDashboardUpdate {
    activeJobs: number;
    queuedJobs: number;
    completedToday: number;
    totalDownloaded: number;
}
export interface SldlSettings {
    soulseek: {
        username: string;
        password: string;
    };
    spotify?: {
        clientId: string;
        clientSecret: string;
        token?: string;
        refreshToken?: string;
    };
    youtube?: {
        apiKey: string;
    };
    defaults: {
        downloadPath: string;
        concurrentDownloads: number;
        nameFormat: string;
        writePlaylist: boolean;
        formats: string[];
        minBitrate?: number;
        maxBitrate?: number;
        minSampleRate?: number;
        maxSampleRate?: number;
        minBitDepth?: number;
        maxBitDepth?: number;
        strictTitle: boolean;
        strictArtist: boolean;
        strictAlbum: boolean;
        fastSearch: boolean;
        desperateMode: boolean;
        artistMaybeWrong: boolean;
        removeFt: boolean;
        regex?: string;
        searchTimeout: number;
        bannedUsers: string[];
        ytDlpFallback: boolean;
        albumArt: "default" | "largest" | "most";
    };
}
export interface SoulseekAccount {
    id: string;
    user_id: string;
    username: string;
    password?: string;
    is_active: boolean;
    created_at: string;
}
export interface CreateJobRequest {
    input: string;
    inputType?: InputType;
    downloadMode: DownloadMode;
    flags?: Record<string, string | boolean | number>;
    profileName?: string;
}
export interface PreviewRequest {
    input: string;
    inputType?: InputType;
    flags?: Record<string, string | boolean | number>;
}
export interface CsvUploadResponse {
    uploadId: string;
    columns: string[];
    rowCount: number;
    preview: Record<string, string>[];
}
export interface CsvMappingRequest {
    uploadId: string;
    mapping: {
        artistCol?: string;
        titleCol?: string;
        albumCol?: string;
        lengthCol?: string;
    };
}
export interface Profile {
    name: string;
    flags: Record<string, string | boolean | number>;
    autoConditions?: {
        inputType?: InputType;
        downloadMode?: DownloadMode;
    };
}
