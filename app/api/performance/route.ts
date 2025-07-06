import { NextRequest, NextResponse } from 'next/server';
import { 
  getTransactionsByPeriodData, 
  getCommissionStatsByPeriodData,
  getTransactionsByCustomPeriodData,
  getCommissionStatsByCustomPeriodData
} from '@/lib/db/analytics-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'month' | 'quarter' | 'year' || 'month';
    const customDate = searchParams.get('date');

    if (!['month', 'quarter', 'year'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 });
    }

    let transactions, commissionStats;

    if (customDate) {
      // Use custom date
      const date = new Date(customDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
      }
      
      [transactions, commissionStats] = await Promise.all([
        getTransactionsByCustomPeriodData(period, date),
        getCommissionStatsByCustomPeriodData(period, date)
      ]);
    } else {
      // Use current date
      [transactions, commissionStats] = await Promise.all([
        getTransactionsByPeriodData(period),
        getCommissionStatsByPeriodData(period)
      ]);
    }

    return NextResponse.json({
      transactions,
      commissionStats,
      period,
      customDate: customDate || null
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
} 