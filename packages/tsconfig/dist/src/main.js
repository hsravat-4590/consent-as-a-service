"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    process.once('SIGUSR2', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
    process.on('SIGINT', function () {
        process.kill(process.pid, 'SIGINT');
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(3003);
}
bootstrap();
//# sourceMappingURL=main.js.map