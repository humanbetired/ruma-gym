import { WebSocketGateway, WebSocketServer, OnGatewayConnection} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QrService } from './qr.service';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'qr',
})
export class QrGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private qrService: QrService) {}

  handleConnection(client: Socket) {
    const currentToken = this.qrService.getCurrentToken();
    if (currentToken) {
      client.emit('qr:rotate', { token: currentToken });
    }
  }

  @OnEvent('qr.rotated')
  broadcastToken(payload: {token: string}) {
    this.server.emit('qr:rotate', { token: payload.token });
  }
}