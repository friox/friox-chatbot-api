import { Module } from "@nestjs/common";
import { TOKENS } from "src/common/constants/di-tokens";
import { CommandService } from "./command.service";
import { SatelliteGk2aCommand } from "./commands/satellite-gk2a.command";

@Module({
  providers: [
    { provide: TOKENS.CHAT_COMMANDS, useClass: SatelliteGk2aCommand },
    CommandService,
  ],
  exports: [CommandService],
})
export class CommandModule {}
