import { Injectable } from '@nestjs/common';
import { forIn } from 'lodash';
import { SyslogEntity } from './entity/syslog.entity';
import { SyslogRepository } from './entity/syslog.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SyslogService {
  constructor(
    @InjectRepository(SyslogRepository)
    private readonly syslogRepository: SyslogRepository,
  ) {}
  async storeLog(data: Partial<SyslogEntity>): Promise<SyslogEntity> {
    return this.syslogRepository.save(data);
  }

  async paginate(options: any): Promise<any> {
    const dataQuery = this.syslogRepository
      .createQueryBuilder('syslog')
      .leftJoin('syslog.usuario', 'usuario')
      .select([
        'syslog.id',
        'syslog.createdAt',
        'syslog.method',
        'syslog.baseUrl',
        'syslog.statusCode',
        'syslog.contentLength',
        'syslog.responseTime',
        'syslog.ip',
        'syslog.event',
        'syslog.params',
        'syslog.query',
        'usuario.id',
        'usuario.nombreCompleto',
        'usuario.correo',
      ]);

    forIn(options.filters, (value, key) => {
      if (key === 'term') {
        dataQuery.orWhere('( syslog.method LIKE :term )', {
          term: `%${value.split(' ').join('%')}%`,
        });

        dataQuery.orWhere('( syslog.baseUrl LIKE :term )', {
          term: `%${value.split(' ').join('%')}%`,
        });

        dataQuery.orWhere('( usuario.correo LIKE :term )', {
          term: `%${value.split(' ').join('%')}%`,
        });

        dataQuery.orWhere('( usuario.nombreCompleto LIKE :term )', {
          term: `%${value.split(' ').join('%')}%`,
        });

        dataQuery.orWhere('( ip = :term )', {
          term: `%${value}%`,
        });

        dataQuery.orWhere('( statusCode = :term )', {
          term: `%${value}%`,
        });
      }
    });

    const count = await dataQuery.getCount();

    if (options.sort === undefined) {
      options.sort = 'syslog.id';
    }

    let direction: 'ASC' | 'DESC' = 'ASC';

    if (options.direction) {
      direction = options.direction;
    }

    const data = await dataQuery
      .skip(options.skip)
      .take(options.take)
      .orderBy(options.sort, direction)
      .getMany();

    return {
      data: data,
      skip: options.skip,
      totalItems: count,
    };
  }

  getById(id: number): Promise<SyslogEntity> {
    return this.syslogRepository
      .createQueryBuilder('syslog')
      .leftJoin('syslog.usuario', 'usuario')
      .select([
        'syslog.id',
        'syslog.usuario',
        'syslog.method',
        'syslog.baseUrl',
        'syslog.statusCode',
        'syslog.contentLength',
        'syslog.userAgent',
        'syslog.ip',
        'syslog.body',
        'syslog.referrer',
        'syslog.event',
        'syslog.params',
        'syslog.query',
        'syslog.responseTime',
        'usuario.id',
        'usuario.nombreCompleto',
        'usuario.correo',
      ])
      .where('syslog.id = :elId', { elId: id })
      .getOne();
  }
}
