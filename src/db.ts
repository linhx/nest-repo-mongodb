import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

export type CSession = ClientSession | undefined;

@Injectable()
export class Db {
  constructor(@InjectConnection() private conn: Connection) {}

  async withTransaction(
    session: CSession,
    callback: (session: CSession) => Promise<any>,
  ) {
    if (session) {
      return callback(session);
    } else {
      const _session = await this.conn.startSession();
      let result;
      await _session.withTransaction<any>(async (ss) => {
        result = await callback(ss);
      });
      return result;
    }
  }
}
