import { PagingDto } from '@linhx/rest-common';
import { CSession } from './db';

export interface Repository<T> {
  create(sess: CSession, t: T): Promise<T>;
  update(sess: CSession, t: T): Promise<T>;
  save(sess: CSession, t: T): Promise<T>;
  delete(sess: CSession, t: T): Promise<T>;
  findAll(
    sess: CSession,
    condition?: Partial<T>,
    paging?: PagingDto,
  ): Promise<T[]>;
  count(sess: CSession, condition?: Partial<T>): Promise<number>;
}
