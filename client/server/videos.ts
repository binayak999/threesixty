import { apiClient, unwrapList } from "./client";

export interface VideoThumbnail {
  _id: string;
  url?: string;
}

export interface VideoItem {
  _id: string;
  title: string;
  youtubeLink: string;
  thumbnail?: VideoThumbnail | null;
}

interface VideosResponse {
  data?: VideoItem[];
}

export async function getVideos(limit?: number): Promise<VideoItem[]> {
  const { data } = await apiClient.get<VideosResponse>("/api/videos");
  const list = unwrapList<VideoItem>(data);
  return limit != null ? list.slice(0, limit) : list;
}
