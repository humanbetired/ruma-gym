import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { FinancialReportQueryDto } from './dto/financial-report.dto';

@Controller('analytics')
@Auth('ADMIN', 'OWNER')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

    @Get('daily-visits')
    getDailyVisits(@Query('days') days?: string) {
        return this.analyticsService.getDailyVisits(days ? Number(days) : 7);
    }

    @Get('peak-hours')
    getPeakHours(@Query('days') days?: string) {
        return this.analyticsService.getPeakHours(days ? Number(days) : 30);
    }

    @Get('member-growth')
    getMemberGrowth(@Query('months') months?: string) {
        return this.analyticsService.getMemberGrowth(months ? Number(months) : 6);

    }

    @Get('member/:userId')
    getMemberStats(@Param('userId') userId: string) {
        return this.analyticsService.getMemberStats(userId);
    }

    @Get('financial-report')
    getFinancialReport(@Query() query: FinancialReportQueryDto) {
    const from = new Date(query.from);
    const to = new Date(query.to);
    to.setHours(23, 59, 59, 999);
    return this.analyticsService.getFinancialReport(from, to);
    }
}

