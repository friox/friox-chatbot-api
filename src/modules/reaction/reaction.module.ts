import { Module } from "@nestjs/common";
import { TOKENS } from "src/common/constants/di-tokens";
import { ReactionService } from "./reaction.service";
import { GalaxyRule } from "./rules/galaxy.rule";

@Module({
  providers: [
    { provide: TOKENS.REACTION_RULES, useClass: GalaxyRule },
    ReactionService,
  ],
  exports: [ReactionService],
})
export class ReactionModule {}
