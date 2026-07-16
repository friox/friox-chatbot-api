import { CommandContext } from "@/common/contexts/chat-domain.context";
import { ChatResponseDto } from "@/common/dto/chat-response.dto";
import { ChatbotException } from "@/common/errors/chatbot.exception";
import { ErrorCode } from "@/common/errors/error-code";
import { ChatCommand } from "@/modules/command/interfaces/chat-command.interface";
import { Injectable } from "@nestjs/common";
import ky from "ky";

interface WeatherImage {
  name: string;
  tm: string;
  url: string;
}

@Injectable()
export class SatelliteGk2aCommand implements ChatCommand {
  trigger = '위성사진';
  description = '';
  usage = '!위성사진 <천연색/적외영상/가시영상>';
  async execute(ctx: CommandContext): Promise<ChatResponseDto> {
    const args = ctx.args;
    const baseUrl = 'https://www.weather.go.kr/w/wnuri-img/rest/sat/images/gk2a.do';
    let option = 'rgb-s-true' // RGB 천연색(AI), Default
    if (args.length == 1) {
      if (args[0] === '적외영상') {
        option = 'ir105';
      } else if (args[0] === '가시영상') {
        option = 'vi006';
      }
    }
    const imgListUrl = `${baseUrl}?data=${option}`;
    const imgList = await ky.get(imgListUrl).json<WeatherImage[]>();
    if (!imgList || imgList.length === 0) {
      throw new ChatbotException(ErrorCode.INVALID_EXTERNAL_API_RESPONSE);
    }
    const imgUrl = 'https://www.weather.go.kr' + imgList[imgList.length - 1].url;
    return ChatResponseDto.media(imgUrl, '!호출어 위성사진 <천연색(기본)/적외영상/가시영상>');
  }
}
