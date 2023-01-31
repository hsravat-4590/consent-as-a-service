import { HealthService } from '../../core/services/health.service';
import { HealthStatus } from '../../core/models/health-status';
export declare class HealthController {
    private healthService;
    constructor(healthService: HealthService);
    getHealth(): HealthStatus;
}
//# sourceMappingURL=health.controller.d.ts.map