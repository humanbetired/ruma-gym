import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { CheckInLog } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  namespace: 'check-in',
})
export class CheckInGateway {
  @WebSocketServer()
  server: Server;

  @OnEvent('checkin.created')
  handleCheckInCreated(payload: { log: CheckInLog; userId: string }) {
    this.server.emit('checkin:new', payload.log);
  }
}