import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RawServerDefault } from 'fastify';
import { BaseEntity } from 'typeorm';

export const addSwagger = (app: NestFastifyApplication<RawServerDefault>) => {
  const options = new DocumentBuilder()
    .setTitle('Iyzads')
    .setDescription('Iyzads  task API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    extraModels: [BaseEntity],
  });
  SwaggerModule.setup('api', app, document);
};
