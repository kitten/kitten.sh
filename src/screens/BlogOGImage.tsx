import satori from 'satori';
import { getPost } from './BlogScreen';
import { colors } from '~/styles/theme';
import { toDateString } from '~/lib/date';

interface Props {
  postId: string;
}

export async function getBlogOGImage(request: Request, { postId }: Props): Promise<Response> {
  const post = getPost(postId);
  if (!post) {
    return new Response('Blog post not found', { status: 404 });
  }

  const fontData = await fetch(new URL('/fonts/188-70.woff', request.url)).then(res => res.arrayBuffer());

  const content = (
    <div style={{
      border: `24px solid ${colors.box}`,
      backgroundColor: colors.background,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 22,
      padding: 52,
      height: '100%',
      width: '100%',
    }}>
      <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
        <span style={{
          textWrap: 'balance',
          fontWeight: 'bold',
          lineHeight: 1.0,
          fontSize: 96,
          textShadow: `1px 1px 0 rgba(0, 0, 0, 0.1), 5px 5px 0 ${colors.passive}`,
          color: colors.text,
          opacity: 0.96,
        }}>
          {post.metadata.title}
        </span>
        <span style={{ fontSize: 62, color: colors.largeText }}>
          {post.metadata.subtitle}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifySelf: 'flex-end' }}>
        <img
          src={new URL('/static/avatar.png', request.url).toString()}
          style={{
            border: `2px solid ${colors.active}`,
            borderRadius: '50%',
            width: 80,
            height: 80,
            marginRight: 25,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 43, color: colors.passive }}>{toDateString(post.metadata.createdAt)}</span>
          <span style={{ fontSize: 43, color: colors.active }}>Phil Pluckthun</span>
        </div>
      </div>
    </div>
  );

  const svg = await satori(content, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: '188-70',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, stale-if-error=31536000, max-age=86400',
    },
  });
}
