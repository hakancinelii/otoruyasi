import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

type Video = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
};

export async function GET() {
  const parser = new Parser({
    customFields: {
      item: [['media:group', 'mediaGroup']]
    }
  });

  try {
    const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UCKt63d3Iw3Zj5m6zjMcByfQ');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videos = feed.items.map((item: any) => {
      const videoId = item.id.replace('yt:video:', '');
      return {
        id: videoId,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    });

    const sortedVideos = videos.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return NextResponse.json(sortedVideos);
  } catch (error) {
    console.error('RSS parse error:', error);
    return NextResponse.json([]);
  }
}
