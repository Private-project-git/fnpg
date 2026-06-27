import { NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Real-time active users (unique IPs in last 5 minutes)
    const activeIpsRaw = await prisma.trafficLog.groupBy({
      by: ['ip'],
      where: {
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    });
    const realtimeActiveUsers = activeIpsRaw.length;

    // 2. Summary stats for last 24h
    const totalViews24h = await prisma.trafficLog.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    const uniqueIps24hRaw = await prisma.trafficLog.groupBy({
      by: ['ip'],
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });
    const uniqueVisitors24h = uniqueIps24hRaw.length;

    // 3. Graph Data (hourly views & unique visitors for past 24h)
    const logs24h = await prisma.trafficLog.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      select: {
        createdAt: true,
        ip: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const hourBuckets: { [key: string]: { views: number; unique: number; date: Date } } = {};
    
    // Pre-populate last 24 hours chronologically to avoid gaps
    for (let i = 23; i >= 0; i--) {
      const bucketDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      bucketDate.setMinutes(0, 0, 0);
      const key = bucketDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      hourBuckets[key] = { views: 0, unique: 0, date: bucketDate };
    }

    const uniqueIpsPerBucket: { [key: string]: Set<string> } = {};
    for (const key in hourBuckets) {
      uniqueIpsPerBucket[key] = new Set<string>();
    }

    logs24h.forEach((log) => {
      const logDate = new Date(log.createdAt);
      logDate.setMinutes(0, 0, 0);
      const key = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      if (hourBuckets[key]) {
        hourBuckets[key].views++;
        if (log.ip) {
          uniqueIpsPerBucket[key].add(log.ip);
        }
      }
    });

    for (const key in hourBuckets) {
      hourBuckets[key].unique = uniqueIpsPerBucket[key].size;
    }

    const graphData = Object.entries(hourBuckets).map(([label, bucket]) => ({
      label,
      views: bucket.views,
      unique: bucket.unique,
      timestamp: bucket.date.toISOString(),
    }));

    // 4. Top Pages
    const topPagesRaw = await prisma.trafficLog.groupBy({
      by: ['path'],
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });
    const topPages = topPagesRaw.map((item) => ({
      path: item.path,
      count: item._count.id,
    }));

    // 5. Top Referrers
    const topReferrersRaw = await prisma.trafficLog.groupBy({
      by: ['referer'],
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });
    const topReferrers = topReferrersRaw.map((item) => ({
      referer: item.referer ? (item.referer.startsWith('http') ? new URL(item.referer).host : item.referer) : 'Direct / None',
      count: item._count.id,
    }));

    // 6. Device & Browser Breakdown
    const userAgents = await prisma.trafficLog.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      select: {
        userAgent: true,
      },
    });

    let mobileCount = 0;
    let desktopCount = 0;
    const browsers: { [key: string]: number } = { Chrome: 0, Safari: 0, Firefox: 0, Edge: 0, Other: 0 };

    userAgents.forEach((ua) => {
      const agent = ua.userAgent || '';
      if (/mobile|android|iphone|ipad|phone/i.test(agent)) {
        mobileCount++;
      } else {
        desktopCount++;
      }

      if (/edg/i.test(agent)) {
        browsers.Edge++;
      } else if (/firefox|fxios/i.test(agent)) {
        browsers.Firefox++;
      } else if (/chrome|crios/i.test(agent)) {
        browsers.Chrome++;
      } else if (/safari/i.test(agent)) {
        browsers.Safari++;
      } else {
        browsers.Other++;
      }
    });

    const totalAgents = userAgents.length || 1;
    const deviceBreakdown = {
      mobile: Math.round((mobileCount / totalAgents) * 100),
      desktop: Math.round((desktopCount / totalAgents) * 100),
    };

    const browserBreakdown = Object.entries(browsers)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalAgents) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // 7. Recent Request Stream (last 30 requests)
    const recentRequests = await prisma.trafficLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 30,
    });

    const stats = {
      realtimeActiveUsers,
      totalViews24h,
      uniqueVisitors24h,
      graphData,
      topPages,
      topReferrers,
      deviceBreakdown,
      browserBreakdown,
      recentRequests,
    };

    return apiSuccess(stats, 'Traffic stats retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching traffic stats in API:', error);
    return apiError('Failed to fetch traffic stats', error?.message || String(error), 500);
  }
}

export async function DELETE() {
  try {
    await prisma.trafficLog.deleteMany({});
    return apiSuccess(null, 'Traffic logs purged successfully');
  } catch (error: any) {
    console.error('Error purging logs:', error);
    return apiError('Failed to purge logs', error?.message || String(error), 500);
  }
}
